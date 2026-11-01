/**
 * VerityBrand review domain types.
 * Shapes intentionally mirror the FastAPI backend models (backend/app/models.py)
 * so the local repository can be swapped for the HTTP client in src/lib/api.ts.
 */

export type Role = "creator" | "reviewer" | "approver" | "admin";

export type FindingKind = "confirmed_violation" | "expired_fact" | "needs_verification" | "low_confidence";
export type Severity = "critical" | "high" | "medium" | "low";
export type FindingStatus = "open" | "accepted" | "edited" | "dismissed";
export type Engine = "rule_engine" | "grounded_verification";

export interface Rule {
  id: string;
  version: string;
  title: string;
  summary: string;
  category: "Regulatory" | "Claims" | "Disclosure" | "Terminology" | "Tone";
  severity: Severity;
  status: "in_force" | "under_review";
  effectiveFrom: string;
}

export interface Fact {
  id: string;
  version: string;
  label: string;
  value: string;
  validFrom: string;
  validUntil: string;
  sourceId: string;
  status: "current" | "expired";
}

export interface Source {
  id: string;
  title: string;
  kind: "Regulation" | "Factsheet" | "Brand guideline";
  issued: string;
  hash: string;
}

export interface Resolution {
  by: string;
  role: Role;
  at: string;
  text?: string;
  reason?: string;
}

export interface Finding {
  id: string;
  kind: FindingKind;
  severity: Severity;
  phrase: string;
  engine: Engine;
  title: string;
  why: string;
  ruleId?: string;
  factId?: string;
  sourceId?: string;
  evidence: string;
  confidence: number;
  confidenceNote: string;
  suggestedFix: string;
  intentNote: string;
  status: FindingStatus;
  resolution?: Resolution;
}

export interface Draft {
  id: string;
  title: string;
  brand: string;
  campaign: string;
  channel: string;
  author: string;
  submittedAt: string;
  version: number;
  text: string;
}

export type AuditAction =
  | "RULE_PUBLISHED"
  | "FACT_VERSIONED"
  | "DRAFT_SUBMITTED"
  | "ANALYSIS_COMPLETED"
  | "FIX_ACCEPTED"
  | "FIX_EDITED"
  | "FINDING_DISMISSED"
  | "FINDING_REOPENED"
  | "CONTENT_APPROVED";

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  role: Role | "system";
  action: AuditAction;
  detail: string;
  ref?: string;
  prevHash: string;
  hash: string;
}

export interface ApprovalRecord {
  certificateId: string;
  approvedBy: string;
  role: Role;
  at: string;
  contentHash: string;
  findings: { accepted: number; edited: number; dismissed: number };
}

export interface ReviewComment {
  id: string;
  author: string;
  role: Role;
  at: string;
  text: string;
}

export interface BrandAsset {
  id: string;
  name: string;
  type: "color" | "logo" | "typography" | "boilerplate";
  value: string;
  rule: string;
}

export interface GlossaryTerm {
  disallowed: string;
  preferred: string;
  reason: string;
  ruleId: string;
}

export type ReviewPhase = "submitted" | "analysing" | "in_review" | "approved";

export interface QueueItem {
  id: string;
  title: string;
  channel: string;
  author: string;
  updated: string;
  status: "in_review" | "queued" | "approved" | "changes_requested";
  findings: number;
  interactive: boolean;
}

export interface RuleInsight {
  ruleId: string;
  title: string;
  dismissalRate: number;
  reviews: number;
  flag?: "unclear";
  feedback: string[];
}
