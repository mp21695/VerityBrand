import type { FindingKind, FindingStatus, Role, Severity } from "./types";

export interface RoleProfile {
  role: Role;
  label: string;
  person: string;
  initials: string;
  summary: string;
  can: {
    analyse: boolean;
    acceptFix: boolean;
    editFix: boolean;
    dismiss: boolean;
    approve: boolean;
    manageGovernance: boolean;
  };
}

export const ROLES: Record<Role, RoleProfile> = {
  creator: {
    role: "creator",
    label: "Creator",
    person: "Riya Sharma",
    initials: "RS",
    summary: "Submits drafts and applies suggested fixes. Cannot dismiss findings or approve.",
    can: { analyse: true, acceptFix: true, editFix: true, dismiss: false, approve: false, manageGovernance: false },
  },
  reviewer: {
    role: "reviewer",
    label: "Reviewer",
    person: "Kabir Mehta",
    initials: "KM",
    summary: "Resolves findings: accept, edit or dismiss with justification. Cannot give final approval.",
    can: { analyse: true, acceptFix: true, editFix: true, dismiss: true, approve: false, manageGovernance: false },
  },
  approver: {
    role: "approver",
    label: "Compliance Approver",
    person: "Arjun Patel",
    initials: "AP",
    summary: "Resolves findings and gives final sign-off once nothing is unresolved.",
    can: { analyse: true, acceptFix: true, editFix: true, dismiss: true, approve: true, manageGovernance: false },
  },
  admin: {
    role: "admin",
    label: "Admin",
    person: "Harini Nair",
    initials: "HN",
    summary: "Manages the Brand Brain and governance configuration. Can also approve.",
    can: { analyse: true, acceptFix: true, editFix: true, dismiss: true, approve: true, manageGovernance: true },
  },
};

export const ROLE_ORDER: Role[] = ["creator", "reviewer", "approver", "admin"];

/** Display metadata. Colour is never the only signal — every state has a text label and icon. */
export const KIND_META: Record<FindingKind, { label: string; short: string; tone: "critical" | "warning" | "info" | "muted" }> = {
  confirmed_violation: { label: "Confirmed violation", short: "Violation", tone: "critical" },
  expired_fact: { label: "Expired fact", short: "Expired", tone: "warning" },
  needs_verification: { label: "Needs verification", short: "Verify", tone: "info" },
  low_confidence: { label: "Low confidence · human review", short: "Review", tone: "muted" },
};

export const SEVERITY_META: Record<Severity, { label: string; rank: number }> = {
  critical: { label: "Critical", rank: 0 },
  high: { label: "High", rank: 1 },
  medium: { label: "Medium", rank: 2 },
  low: { label: "Low", rank: 3 },
};

export const STATUS_META: Record<FindingStatus, { label: string }> = {
  open: { label: "Unresolved" },
  accepted: { label: "Fix accepted" },
  edited: { label: "Fix edited" },
  dismissed: { label: "Dismissed" },
};

/** Token-based class sets per tone (no raw colour values in components). */
export const TONE_CLASSES = {
  critical: { mark: "bg-critical-soft", markActive: "bg-critical/20 shadow-[inset_0_-2px_0_var(--color-critical)]", chip: "bg-critical-soft text-critical", dot: "bg-critical", line: "bg-critical" },
  warning: { mark: "bg-warning-soft", markActive: "bg-warning/20 shadow-[inset_0_-2px_0_var(--color-warning)]", chip: "bg-warning-soft text-warning", dot: "bg-warning", line: "bg-warning" },
  info: { mark: "bg-info-soft", markActive: "bg-info/20 shadow-[inset_0_-2px_0_var(--color-info)]", chip: "bg-info-soft text-info", dot: "bg-info", line: "bg-info" },
  muted: { mark: "bg-surface-muted", markActive: "bg-text-muted/20 shadow-[inset_0_-2px_0_var(--color-text-muted)]", chip: "bg-surface-muted text-text-secondary", dot: "bg-text-muted", line: "bg-text-muted" },
} as const;
