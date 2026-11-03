import { makeAuditEntry, sha256 } from "./index-internal";
import { KIND_META, ROLES } from "./meta";
import { analyzeAnyContent } from "./analyzer";
import type { ApprovalRecord, AuditEntry, CampaignVersionSnapshot, Draft, Finding, ReviewPhase, Role, StaleAlert } from "./types";

export interface ReviewState {
  draft: Draft;
  phase: ReviewPhase;
  findings: Finding[];
  audit: AuditEntry[];
  approval?: ApprovalRecord;
  role: Role;
  selectedId?: string;
  versionHistory: CampaignVersionSnapshot[];
  currentVersionIndex: number;
  staleAlert?: StaleAlert;
  creativeUri: string;
  creativeVersion: number;
}

export type ReviewAction =
  | { type: "set_role"; role: Role }
  | { type: "select"; id?: string }
  | { type: "analysis_started" }
  | { type: "analysis_completed"; findings: Finding[]; at: string }
  | { type: "accept"; id: string; at: string }
  | { type: "apply_fix"; findingId: string; at: string; text?: string }
  | { type: "edit"; id: string; text: string; at: string }
  | { type: "dismiss"; id: string; reason: string; at: string }
  | { type: "reopen"; id: string; at: string }
  | { type: "submit_custom_draft"; draft: Draft; findings: Finding[]; at: string }
  | { type: "replace_creative"; fileName: string; fileUri: string; at: string }
  | { type: "expire_fact"; factId: string; at: string }
  | { type: "restore_fact"; factId: string; at: string }
  | { type: "select_version"; versionNumber: number }
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
    case "apply_fix": {
      const f = state.findings.find(
        (x) =>
          x.id === action.findingId ||
          (action.findingId.startsWith("FND-") && x.id.includes(action.findingId.replace("FND-", ""))) ||
          (x.ruleId && x.ruleId.startsWith(action.findingId))
      );
      if (!f) return state;

      const targetPhrase = f.phrase;
      const replacement = action.text?.trim() || f.suggestedFix;
      let newText = state.draft.text;
      if (newText.includes(targetPhrase)) {
        newText = newText.replace(targetPhrase, replacement);
      } else {
        const escaped = targetPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        newText = newText.replace(new RegExp(escaped, "i"), replacement);
      }
      const nextVer = state.draft.version + 1;
      const now = action.at;

      // 1. Preserve current version snapshot in history if not already captured
      let history = state.versionHistory ? [...state.versionHistory] : [];
      if (history.length === 0) {
        history.push({
          version: state.draft.version,
          label: `v${state.draft.version} — Original Draft`,
          text: state.draft.text,
          creativeUri: state.creativeUri || "/images/NOVA_AeroRun_Campaign.png",
          creativeVersion: state.creativeVersion || 1,
          author: state.draft.author,
          timestamp: state.draft.submittedAt,
          reason: "Initial multi-modal draft submission & OCR pass",
          findingsCount: state.findings.length,
          openCount: unresolvedCount(state.findings),
          findings: state.findings,
          contentHash: sha256(state.draft.text),
        });
      }

      // 2. Rerun complete governance analysis against the new version text
      const rawNewFindings = analyzeAnyContent(newText, "text", undefined, {
        isPricingExpired: state.staleAlert?.active,
      });

      // Maintain any image findings / verified facts from current state
      const verifiedItems = state.findings.filter((x) => x.isVerified);
      const combinedFindings: Finding[] = [...rawNewFindings];
      for (const vi of verifiedItems) {
        if (!combinedFindings.some((cf) => cf.id === vi.id || cf.phrase === vi.phrase || (cf.phrase.includes("3,999") && vi.phrase.includes("3,999")))) {
          combinedFindings.push(vi);
        }
      }

      const openRemaining = unresolvedCount(combinedFindings);
      const newContentHash = sha256(newText);

      // 3. New version snapshot
      const newSnapshot: CampaignVersionSnapshot = {
        version: nextVer,
        label: `v${nextVer} — Suggested Fix Applied`,
        text: newText,
        creativeUri: state.creativeUri || "/images/NOVA_AeroRun_Campaign.png",
        creativeVersion: state.creativeVersion || 1,
        author: person,
        timestamp: now,
        originalText: targetPhrase,
        changedText: replacement,
        reason: `Applied fix for ${f.ruleId || f.title}: “${targetPhrase}” → “${replacement}”`,
        findingsCount: combinedFindings.length,
        openCount: openRemaining,
        findings: combinedFindings,
        contentHash: newContentHash,
      };

      history.push(newSnapshot);

      // 4. Create immutable audit entries: SUGGESTED_FIX_APPLIED and CAMPAIGN_VERSION_CREATED
      const auditFix = makeAuditEntry(
        state.audit[state.audit.length - 1],
        {
          at: now,
          actor: person,
          role: state.role,
          action: "SUGGESTED_FIX_APPLIED",
          detail: `Suggested fix applied — Original: “${targetPhrase}” → New: “${replacement}” (Version: v${nextVer})`,
          ref: `v${nextVer}`,
        },
        state.audit.length
      );

      const auditVer = makeAuditEntry(
        auditFix,
        {
          at: now,
          actor: person,
          role: state.role,
          action: "CAMPAIGN_VERSION_CREATED",
          detail: `Created campaign version v${nextVer} (open findings reduced to ${openRemaining})`,
          ref: `sha256:${newContentHash.slice(0, 12)}`,
        },
        state.audit.length + 1
      );

      const newAudit = [...state.audit, auditFix, auditVer];

      // If all findings resolved, log approval unlocked!
      if (openRemaining === 0) {
        const auditUnlock = makeAuditEntry(
          auditVer,
          {
            at: now,
            actor: "VerityBrand Governance Engine",
            role: "system",
            action: "APPROVAL_UNLOCKED",
            detail: `Approval gate unlocked — 0 unresolved findings in v${nextVer}. Ready for compliance certification.`,
            ref: `v${nextVer}`,
          },
          newAudit.length
        );
        newAudit.push(auditUnlock);
      }

      return {
        ...state,
        draft: {
          ...state.draft,
          version: nextVer,
          text: newText,
        },
        findings: combinedFindings,
        versionHistory: history,
        currentVersionIndex: history.length - 1,
        audit: newAudit,
        selectedId: combinedFindings.find((x) => x.status === "open")?.id || combinedFindings[0]?.id,
        phase: "in_review",
      };
    }
    case "expire_fact": {
      const now = action.at;
      const isDependent =
        state.draft.text.includes("₹3,999") ||
        state.findings.some((f) => f.factId === action.factId || f.phrase.includes("3,999"));

      if (!isDependent) return state;

      // 1. Mark campaign RE-REVIEW REQUIRED
      // 2. Automatically rerun governance analysis with expired pricing flag
      const reanalyzedFindings = analyzeAnyContent(state.draft.text, "text", undefined, {
        isPricingExpired: true,
        expiredFactIds: [action.factId],
      });

      // Maintain verified non-pricing claims (e.g. durability PT-2026-041)
      const verifiedDurability = state.findings.find((x) => x.phrase.includes("40 km"));
      if (verifiedDurability && !reanalyzedFindings.some((f) => f.phrase.includes("40 km"))) {
        reanalyzedFindings.push(verifiedDurability);
      }

      const wasApproved = state.phase === "approved" || Boolean(state.approval);

      // 3. Create immutable audit entries: FACT_EXPIRED, CLAIM_REVIEW_TRIGGERED, AUTO_REANALYSIS_COMPLETED
      const auditExpired = makeAuditEntry(
        state.audit[state.audit.length - 1],
        {
          at: now,
          actor: "Temporal Radar Service",
          role: "system",
          action: "FACT_EXPIRED",
          detail: `Fact F-08 (Launch campaign price ₹3,999) expired on 15 Nov 2026. Standard retail price of ₹4,499 now applies.`,
          ref: action.factId,
        },
        state.audit.length
      );

      const auditTrigger = makeAuditEntry(
        auditExpired,
        {
          at: now,
          actor: "VerityBrand Lifecycle Worker",
          role: "system",
          action: "CLAIM_REVIEW_TRIGGERED",
          detail: `Campaign “${state.draft.title}” depends on expired fact ${action.factId} — marked RE-REVIEW REQUIRED`,
          ref: state.draft.id,
        },
        state.audit.length + 1
      );

      const auditAuto = makeAuditEntry(
        auditTrigger,
        {
          at: now,
          actor: "Grounded Rule Engine",
          role: "system",
          action: "AUTO_REANALYSIS_COMPLETED",
          detail: `Automatic re-analysis completed: flagged 1 new Expired Promotional Claim (Rule R-05)`,
          ref: "R-05",
        },
        state.audit.length + 2
      );

      const newAudit = [...state.audit, auditExpired, auditTrigger, auditAuto];

      if (wasApproved) {
        const auditLock = makeAuditEntry(
          auditAuto,
          {
            at: now,
            actor: "Compliance Enforcer",
            role: "system",
            action: "APPROVAL_LOCKED",
            detail: `Campaign approval revoked and locked due to stale pricing fact F-08. Re-review mandatory.`,
            ref: state.draft.id,
          },
          newAudit.length
        );
        newAudit.push(auditLock);
      }

      const staleAlert: StaleAlert = {
        active: true,
        factId: action.factId,
        factLabel: "NOVA AeroRun X1 · Launch campaign price (₹3,999)",
        reason: "Pricing fact validity ended on 15 Nov 2026. Standard retail price of ₹4,499 applies.",
        triggeredAt: now,
        affectedClaims: ["Now ₹3,999"],
        affectedCampaign: state.draft.title,
        status: "re_review_required",
      };

      return {
        ...state,
        phase: "re_review_required",
        approval: undefined,
        findings: reanalyzedFindings,
        staleAlert,
        audit: newAudit,
        selectedId: reanalyzedFindings.find((f) => f.kind === "expired_fact")?.id || reanalyzedFindings[0]?.id,
      };
    }
    case "restore_fact": {
      const now = action.at;
      const reanalyzedFindings = analyzeAnyContent(state.draft.text, "text", undefined, {
        isPricingExpired: false,
      });

      const verifiedDurability = state.findings.find((x) => x.phrase.includes("40 km"));
      if (verifiedDurability && !reanalyzedFindings.some((f) => f.phrase.includes("40 km"))) {
        reanalyzedFindings.push(verifiedDurability);
      }

      const auditRestore = makeAuditEntry(
        state.audit[state.audit.length - 1],
        {
          at: now,
          actor: person,
          role: state.role,
          action: "FACT_VERSIONED",
          detail: `Extended validity for Fact ${action.factId} (₹3,999) through 31 Dec 2026`,
          ref: action.factId,
        },
        state.audit.length
      );

      return {
        ...state,
        phase: unresolvedCount(reanalyzedFindings) === 0 ? "in_review" : "in_review",
        findings: reanalyzedFindings,
        staleAlert: undefined,
        audit: [...state.audit, auditRestore],
      };
    }
    case "select_version": {
      const idx = state.versionHistory.findIndex((v) => v.version === action.versionNumber);
      if (idx < 0) return state;
      return {
        ...state,
        currentVersionIndex: idx,
      };
    }
    case "replace_creative": {
      const nextVer = state.draft.version + 1;
      const contentHash = sha256(`creative:${action.fileName}:${nextVer}:${action.at}`);
      const nextCreativeVer = (state.creativeVersion || 1) + 1;

      let history = state.versionHistory ? [...state.versionHistory] : [];
      if (history.length === 0) {
        history.push({
          version: state.draft.version,
          label: `v${state.draft.version} — Original Draft`,
          text: state.draft.text,
          creativeUri: state.creativeUri || "/images/NOVA_AeroRun_Campaign.png",
          creativeVersion: state.creativeVersion || 1,
          author: state.draft.author,
          timestamp: state.draft.submittedAt,
          reason: "Initial draft submission & OCR pass",
          findingsCount: state.findings.length,
          openCount: unresolvedCount(state.findings),
          findings: state.findings,
          contentHash: sha256(state.draft.text),
        });
      }

      const newSnapshot: CampaignVersionSnapshot = {
        version: nextVer,
        label: `v${nextVer} — Creative Replaced (Creative v${nextCreativeVer})`,
        text: state.draft.text,
        creativeUri: action.fileUri,
        creativeVersion: nextCreativeVer,
        author: person,
        timestamp: action.at,
        reason: `Replaced creative asset with “${action.fileName}”`,
        findingsCount: state.findings.length,
        openCount: unresolvedCount(state.findings),
        findings: state.findings,
        contentHash,
      };

      history.push(newSnapshot);

      const auditCreative = makeAuditEntry(
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

      const auditVer = makeAuditEntry(
        auditCreative,
        {
          at: action.at,
          actor: person,
          role: state.role,
          action: "CAMPAIGN_VERSION_CREATED",
          detail: `Created campaign version v${nextVer} from updated creative asset (Creative v${nextCreativeVer})`,
          ref: `v${nextVer}`,
        },
        state.audit.length + 1
      );

      return {
        ...state,
        draft: {
          ...state.draft,
          version: nextVer,
        },
        creativeUri: action.fileUri,
        creativeVersion: nextCreativeVer,
        versionHistory: history,
        currentVersionIndex: history.length - 1,
        phase: "in_review",
        approval: undefined,
        audit: [...state.audit, auditCreative, auditVer],
      };
    }
    case "approve": {
      if (
        locked ||
        !can.approve ||
        state.phase === "re_review_required" ||
        unresolvedCount(state.findings) > 0
      ) {
        return state;
      }
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
        detail: `Approved v${state.draft.version} with ${counts.accepted} accepted, ${counts.edited} edited, ${counts.dismissed} dismissed`,
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

      const history = state.versionHistory ? [...state.versionHistory] : [];
      history.push({
        version: state.draft.version,
        label: `v${state.draft.version} — Approved & Sealed`,
        text: finalText,
        creativeUri: state.creativeUri || "/images/NOVA_AeroRun_Campaign.png",
        creativeVersion: state.creativeVersion || 1,
        author: person,
        timestamp: action.at,
        reason: `Final compliance approval certificate issued: ${approval.certificateId}`,
        findingsCount: state.findings.length,
        openCount: 0,
        findings: state.findings,
        contentHash,
      });

      return { ...state, phase: "approved", approval, audit, versionHistory: history, currentVersionIndex: history.length - 1 };
    }
    case "reset":
      return action.state;
    default:
      return state;
  }
}
