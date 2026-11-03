import { makeAuditEntry, sha256 } from "./index-internal";
import { KIND_META, ROLES } from "./meta";
import type { ApprovalRecord, AuditEntry, Draft, Finding, ReviewPhase, Role } from "./types";

export interface ReviewState {
  draft: Draft;
  phase: ReviewPhase;
  findings: Finding[];
  audit: AuditEntry[];
  approval?: ApprovalRecord;
  role: Role;
  selectedId?: string;
}

export type ReviewAction =
  | { type: "set_role"; role: Role }
  | { type: "select"; id?: string }
  | { type: "analysis_started" }
  | { type: "analysis_completed"; findings: Finding[]; at: string }
  | { type: "accept"; id: string; at: string }
  | { type: "edit"; id: string; text: string; at: string }
  | { type: "dismiss"; id: string; reason: string; at: string }
  | { type: "reopen"; id: string; at: string }
  | { type: "submit_custom_draft"; draft: Draft; findings: Finding[]; at: string }
  | { type: "replace_creative"; fileName: string; fileUri: string; at: string }
  | { type: "approve"; at: string }
  | { type: "reset"; state: ReviewState };

export const unresolvedCount = (findings: Finding[]) => findings.filter((f) => f.status === "open").length;

/** Applies accepted / edited fixes to the original draft text. */
export function revisedText(draft: Draft, findings: Finding[]): string {
  let text = draft.text;
  for (const f of findings) {
    if (f.status === "accepted") text = text.replace(f.phrase, f.suggestedFix);
    if (f.status === "edited" && f.resolution?.text) text = text.replace(f.phrase, f.resolution.text);
  }
  return text;
}

/** Splits text into plain and finding-linked segments, ordered by position. */
export function segmentText(text: string, findings: Finding[]) {
  const spans = findings
    .map((f) => ({ f, start: text.indexOf(f.phrase) }))
    .filter((s) => s.start >= 0)
    .sort((a, b) => a.start - b.start);
  const out: { text: string; finding?: Finding }[] = [];
  let cursor = 0;
  for (const { f, start } of spans) {
    if (start < cursor) continue;
    if (start > cursor) out.push({ text: text.slice(cursor, start) });
    out.push({ text: f.phrase, finding: f });
    cursor = start + f.phrase.length;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor) });
  return out;
}

function log(state: ReviewState, input: Omit<Parameters<typeof makeAuditEntry>[1], "actor" | "role">): AuditEntry[] {
  const p = ROLES[state.role];
  const entry = makeAuditEntry(state.audit[state.audit.length - 1], { ...input, actor: p.person, role: state.role }, state.audit.length);
  return [...state.audit, entry];
}

function resolve(state: ReviewState, id: string, patch: Partial<Finding>): Finding[] {
  return state.findings.map((f) => (f.id === id ? { ...f, ...patch } : f));
}

export function reviewReducer(state: ReviewState, action: ReviewAction): ReviewState {
  const person = ROLES[state.role].person;
  const can = ROLES[state.role].can;
  const locked = state.phase === "approved";

  switch (action.type) {
    case "set_role":
      return { ...state, role: action.role };
    case "select":
      return { ...state, selectedId: action.id };
    case "analysis_started":
      return { ...state, phase: "analysing" };
    case "submit_custom_draft": {
      const audit = makeAuditEntry(
        state.audit[state.audit.length - 1],
        {
          at: action.at,
          actor: action.draft.author,
          role: state.role,
          action: "DRAFT_SUBMITTED",
          detail: `Submitted new ${action.draft.channel} draft “${action.draft.title}”`,
          ref: `sha256:${sha256(action.draft.text).slice(0, 10)}`,
        },
        state.audit.length
      );
      return {
        ...state,
        draft: action.draft,
        phase: "in_review",
        findings: action.findings,
        audit: [...state.audit, audit],
        approval: undefined,
        selectedId: action.findings[0]?.id,
      };
    }
    case "analysis_completed": {
      const audit = makeAuditEntry(
        state.audit[state.audit.length - 1],
        {
          at: action.at,
          actor: "VerityBrand engine",
          role: "system",
          action: "ANALYSIS_COMPLETED",
          detail: `Rule engine + grounded verification: ${action.findings.length} findings (${action.findings
            .map((f) => KIND_META[f.kind].short.toLowerCase())
            .join(", ")})`,
          ref: "Brand Brain · rules v2026.11",
        },
        state.audit.length,
      );
      return { ...state, phase: "in_review", findings: action.findings, audit: [...state.audit, audit], selectedId: action.findings[0]?.id };
    }
    case "accept": {
      if (locked || !can.acceptFix) return state;
      const f = state.findings.find((x) => x.id === action.id);
      if (!f || f.status !== "open") return state;
      return {
        ...state,
        findings: resolve(state, action.id, { status: "accepted", resolution: { by: person, role: state.role, at: action.at, text: f.suggestedFix } }),
        audit: log(state, { at: action.at, action: "FIX_ACCEPTED", detail: `Accepted fix for “${f.phrase}” → “${f.suggestedFix}”`, ref: f.ruleId ?? f.factId }),
      };
    }
    case "edit": {
      if (locked || !can.editFix) return state;
      const f = state.findings.find((x) => x.id === action.id);
      if (!f || f.status !== "open" || !action.text.trim()) return state;
      return {
        ...state,
        findings: resolve(state, action.id, { status: "edited", resolution: { by: person, role: state.role, at: action.at, text: action.text.trim() } }),
        audit: log(state, { at: action.at, action: "FIX_EDITED", detail: `Edited fix for “${f.phrase}” → “${action.text.trim()}”`, ref: f.ruleId ?? f.factId }),
      };
    }
    case "dismiss": {
      if (locked || !can.dismiss) return state;
      const f = state.findings.find((x) => x.id === action.id);
      if (!f || f.status !== "open" || action.reason.trim().length < 8) return state;
      return {
        ...state,
        findings: resolve(state, action.id, { status: "dismissed", resolution: { by: person, role: state.role, at: action.at, reason: action.reason.trim() } }),
        audit: log(state, { at: action.at, action: "FINDING_DISMISSED", detail: `Dismissed “${f.phrase}” — “${action.reason.trim()}”`, ref: f.ruleId ?? f.factId }),
      };
    }
    case "reopen": {
      if (locked) return state;
      const f = state.findings.find((x) => x.id === action.id);
      if (!f || f.status === "open") return state;
      if (f.status === "dismissed" ? !can.dismiss : !can.acceptFix) return state;
      return {
        ...state,
        findings: resolve(state, action.id, { status: "open", resolution: undefined }),
        audit: log(state, { at: action.at, action: "FINDING_REOPENED", detail: `Reopened “${f.phrase}”`, ref: f.ruleId ?? f.factId }),
      };
    }
    case "replace_creative": {
      const nextVer = state.draft.version + 1;
      const contentHash = sha256(`creative:${action.fileName}:${nextVer}:${action.at}`);
      const audit = makeAuditEntry(
        state.audit[state.audit.length - 1],
        {
          at: action.at,
          actor: person,
          role: state.role,
          action: "CREATIVE_REPLACED",
          detail: `Uploaded new campaign creative “${action.fileName}” — incremented draft to v${nextVer}`,
          ref: `sha256:${contentHash.slice(0, 12)}`,
        },
        state.audit.length
      );
      return {
        ...state,
        draft: {
          ...state.draft,
          version: nextVer,
        },
        phase: "in_review",
        approval: undefined,
        audit: [...state.audit, audit],
      };
    }
    case "approve": {
      if (locked || !can.approve || state.phase !== "in_review" || unresolvedCount(state.findings) > 0) return state;
      const finalText = revisedText(state.draft, state.findings);
      const contentHash = sha256(finalText);
      const counts = {
        accepted: state.findings.filter((f) => f.status === "accepted").length,
        edited: state.findings.filter((f) => f.status === "edited").length,
        dismissed: state.findings.filter((f) => f.status === "dismissed").length,
      };
      const audit = log(state, {
        at: action.at,
        action: "CONTENT_APPROVED",
        detail: `Approved v${state.draft.version + 1} with ${counts.accepted} accepted, ${counts.edited} edited, ${counts.dismissed} dismissed`,
        ref: `sha256:${contentHash.slice(0, 12)}`,
      });
      const approval: ApprovalRecord = {
        certificateId: `VB-CERT-${audit[audit.length - 1].hash.slice(0, 8).toUpperCase()}`,
        approvedBy: person,
        role: state.role,
        at: action.at,
        contentHash,
        findings: counts,
      };
      return { ...state, phase: "approved", approval, audit };
    }
    case "reset":
      return action.state;
    default:
      return state;
  }
}
