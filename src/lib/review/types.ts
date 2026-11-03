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
  sourceDoc?: string;
  sourceLocation?: string;
  status: "current" | "expired";
  timestamp?: string;
}

export interface Source {
  id: string;
  title: string;
  kind: "Regulation" | "Factsheet" | "Brand guideline";
  issued: string;
  hash: string;
  fileUri?: string;
  pages?: number;
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
  regionId?: string;
  boundingBox?: { x: number; y: number; w: number; h: number };
  isVerified?: boolean;
}

export interface OCRTextRegion {
  id: string;
  text: string;
  box: { x: number; y: number; w: number; h: number }; // normalized percentages (0-100)
  confidence: number;
  status: "verified" | "flagged" | "neutral";
  findingId?: string;
  ruleId?: string;
  evidenceRef?: string;
}

export interface CreativeAssetMetadata {
  id: string;
  fileName: string;
  fileUri: string;
  dimensions: { width: number; height: number };
  aspectRatio: string;
  altText: string;
  contrastRatio: number;
  contrastStatus: "pass" | "fail";
  logoClearspace: { top: number; left: number; pass: boolean; minRequiredPx: number };
  readabilityGrade: string;
  uploadedAt: string;
  version: number;
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
  | "FACT_EXPIRED"
  | "CLAIM_REVIEW_TRIGGERED"
  | "AUTO_REANALYSIS_COMPLETED"
  | "SUGGESTED_FIX_APPLIED"
  | "CAMPAIGN_VERSION_CREATED"
  | "APPROVAL_LOCKED"
  | "APPROVAL_UNLOCKED"
  | "DRAFT_SUBMITTED"
  | "ANALYSIS_COMPLETED"
  | "FIX_ACCEPTED"
  | "FIX_EDITED"
  | "FINDING_DISMISSED"
  | "FINDING_REOPENED"
  | "CONTENT_APPROVED"
  | "CREATIVE_UPLOADED"
  | "CREATIVE_REPLACED";

export interface CampaignVersionSnapshot {
  version: number;
  label: string;
  text: string;
  creativeUri: string;
  creativeVersion: number;
  author: string;
  timestamp: string;
  changedText?: string;
  originalText?: string;
  reason?: string;
  findingsCount: number;
  openCount: number;
  findings: Finding[];
  contentHash: string;
}

export interface StaleAlert {
  active: boolean;
  factId: string;
  factLabel: string;
  reason: string;
  triggeredAt: string;
  affectedClaims: string[];
  affectedCampaign: string;
  status: "re_review_required" | "resolved";
}

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

export type ReviewPhase = "submitted" | "analysing" | "in_review" | "approved" | "re_review_required";

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
