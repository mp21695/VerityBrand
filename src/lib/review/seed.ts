/**
 * Seeded demo data for the VerityBrand Review Workspace.
 * Content follows the product's demo scenario (Arthaa Gold Savings Fund).
 * Brand, people and figures are fictional.
 */
import { sha256 } from "./hash";
import type { AuditAction, AuditEntry, Draft, Fact, Finding, QueueItem, Role, Rule, RuleInsight, Source } from "./types";

export const DEMO_DRAFT: Draft = {
  id: "draft-gold-fund",
  title: "Gold Savings Fund — launch copy",
  brand: "Arthaa Finserv",
  campaign: "Diwali Wealth 2026",
  channel: "Paid social · Landing hero",
  author: "Riya Sharma",
  submittedAt: "2026-11-01T10:42:00+05:30",
  version: 2,
  text: "Build steady wealth with guaranteed 12% returns from the Arthaa Gold Savings Fund, India's #1 fund managing ₹4,200 crore. Start a SIP today.",
};

export const RULES: Rule[] = [
  {
    id: "R-07",
    version: "2.0",
    title: "No guaranteed or assured returns",
    summary: "Market-linked products must never state or imply guaranteed, assured, fixed or risk-free returns.",
    category: "Regulatory",
    severity: "critical",
    status: "in_force",
    effectiveFrom: "2026-01-01",
  },
  {
    id: "R-02",
    version: "1.0",
    title: "Market-risk disclaimer required",
    summary: "Copy that mentions returns, funds or investing carries the standard market-risk disclosure.",
    category: "Disclosure",
    severity: "high",
    status: "in_force",
    effectiveFrom: "2026-01-01",
  },
  {
    id: "R-12",
    version: "1.0",
    title: "Ranking claims need a current source",
    summary: "‘#1’, ‘best’ or ‘leading’ claims must cite an approved, unexpired third-party ranking.",
    category: "Claims",
    severity: "high",
    status: "under_review",
    effectiveFrom: "2026-01-01",
  },
  {
    id: "G-04",
    version: "1.1",
    title: "Spell out ‘SIP’ on first use",
    summary: "Retail copy writes ‘Systematic Investment Plan (SIP)’ the first time it appears.",
    category: "Terminology",
    severity: "low",
    status: "in_force",
    effectiveFrom: "2026-03-15",
  },
  {
    id: "T-03",
    version: "1.2",
    title: "Calm, plain-spoken voice",
    summary: "Prefer steady, habit-oriented language over hype or urgency.",
    category: "Tone",
    severity: "low",
    status: "in_force",
    effectiveFrom: "2026-07-12",
  },
];

export const SOURCES: Source[] = [
  { id: "E-007", title: "Mutual fund advertising code — clause 7B", kind: "Regulation", issued: "2025-12-18", hash: sha256("E-007 advertising code clause 7B") },
  { id: "E-014", title: "Gold Savings Fund factsheet — Q1 FY27", kind: "Factsheet", issued: "2026-04-10", hash: sha256("E-014 factsheet Q1 FY27") },
  { id: "E-021", title: "Gold Savings Fund audited factsheet — Q2 FY27", kind: "Factsheet", issued: "2026-10-08", hash: sha256("E-021 audited factsheet Q2 FY27") },
  { id: "E-102", title: "Arthaa voice & glossary", kind: "Brand guideline", issued: "2026-07-12", hash: sha256("E-102 voice glossary") },
];

export const FACTS: Fact[] = [
  { id: "F-021", version: "1", label: "Gold Savings Fund · AUM", value: "₹4,200 crore", validFrom: "2026-01-01", validUntil: "2026-06-30", sourceId: "E-014", status: "expired" },
  { id: "F-021", version: "2", label: "Gold Savings Fund · AUM", value: "₹4,850 crore", validFrom: "2026-07-01", validUntil: "2026-12-31", sourceId: "E-021", status: "current" },
  { id: "F-034", version: "1", label: "Gold Savings Fund · 5-year CAGR", value: "11.4%", validFrom: "2026-04-01", validUntil: "2027-03-31", sourceId: "E-014", status: "current" },
  { id: "F-042", version: "1", label: "Minimum monthly SIP", value: "₹500", validFrom: "2026-01-01", validUntil: "2027-06-30", sourceId: "E-021", status: "current" },
];

export const DEMO_FINDINGS: Finding[] = [
  {
    id: "FND-1",
    kind: "confirmed_violation",
    severity: "critical",
    phrase: "guaranteed 12% returns",
    engine: "rule_engine",
    title: "Guaranteed return claim",
    why: "Market-linked funds can’t promise a fixed return. Presenting 12% as guaranteed misleads investors and breaches the advertising code.",
    ruleId: "R-07",
    sourceId: "E-007",
    evidence: "R-07 v2.0 prohibits ‘guaranteed’, ‘assured’ or ‘risk-free’ return language for market-linked schemes (advertising code, clause 7B).",
    confidence: 0.99,
    confidenceNote: "Deterministic rule match",
    suggestedFix: "an 11.4% five-year average return*",
    intentNote: "Keeps the growth appeal, swapping the promise for the approved historical figure (F-034).",
    status: "open",
  },
  {
    id: "FND-2",
    kind: "expired_fact",
    severity: "medium",
    phrase: "₹4,200 crore",
    engine: "grounded_verification",
    title: "Fund size has expired",
    why: "This matches F-021 v1, which was valid until 30 Jun 2026. Publishing it now would misstate the fund’s current size.",
    factId: "F-021",
    sourceId: "E-021",
    evidence: "F-021 v2 is current: ₹4,850 crore, valid 1 Jul – 31 Dec 2026, from the audited Q2 FY27 factsheet.",
    confidence: 0.97,
    confidenceNote: "Exact match to an expired fact",
    suggestedFix: "₹4,850 crore",
    intentNote: "Keeps the scale proof point, updated to the current audited value.",
    status: "open",
  },
  {
    id: "FND-3",
    kind: "needs_verification",
    severity: "high",
    phrase: "India's #1 fund",
    engine: "grounded_verification",
    title: "Unsupported ranking claim",
    why: "Ranking claims need a current third-party source. Nothing in the Source Vault supports a #1 ranking, so it can’t be confirmed — or called false.",
    ruleId: "R-12",
    evidence: "Searched 14 approved sources. No ranking evidence found for ‘#1’ in any category.",
    confidence: 0.86,
    confidenceNote: "Evidence absent — abstained from a verdict",
    suggestedFix: "a leading gold savings fund",
    intentNote: "Keeps the strong positioning without an unprovable superlative. Or attach an approved ranking source.",
    status: "open",
  },
  {
    id: "FND-4",
    kind: "low_confidence",
    severity: "low",
    phrase: "Start a SIP today",
    engine: "rule_engine",
    title: "Acronym not spelled out",
    why: "The glossary asks for ‘SIP’ to be written in full on first use. On short paid-social copy this may be acceptable — a reviewer should decide.",
    ruleId: "G-04",
    sourceId: "E-102",
    evidence: "G-04 v1.1: write ‘Systematic Investment Plan (SIP)’ the first time it appears in retail copy.",
    confidence: 0.58,
    confidenceNote: "Context-dependent — human review advised",
    suggestedFix: "Start a Systematic Investment Plan (SIP) today",
    intentNote: "Keeps the call to action, adding clarity for first-time investors.",
    status: "open",
  },
];

export const QUEUE: QueueItem[] = [
  { id: "draft-gold-fund", title: "Gold Savings Fund — launch copy", channel: "Paid social", author: "Riya Sharma", updated: "Today, 10:42", status: "in_review", findings: 4, interactive: true },
  { id: "draft-elss", title: "Tax Saver ELSS — direct mailer", channel: "Email", author: "Kabir Mehta", updated: "Today, 09:15", status: "queued", findings: 3, interactive: false },
  { id: "draft-sip-carousel", title: "SIP habits — educational carousel", channel: "Instagram", author: "Riya Sharma", updated: "Yesterday", status: "changes_requested", findings: 2, interactive: false },
  { id: "draft-festive", title: "Festive gold comparison guide", channel: "Web article", author: "Meera Iyer", updated: "28 Oct", status: "approved", findings: 3, interactive: false },
];

export const RULE_INSIGHTS: RuleInsight[] = [
  {
    ruleId: "R-12",
    title: "Ranking claims need a current source",
    dismissalRate: 0.34,
    reviews: 41,
    flag: "unclear",
    feedback: [
      "Valid only when referring to historical performance.",
      "Category leadership with a dated CRISIL citation should pass.",
      "‘Leading’ is generic, not a ranking claim.",
    ],
  },
  { ruleId: "T-03", title: "Calm, plain-spoken voice", dismissalRate: 0.12, reviews: 58, feedback: ["Educational headlines need more latitude."] },
  { ruleId: "G-04", title: "Spell out ‘SIP’ on first use", dismissalRate: 0.09, reviews: 33, feedback: [] },
  { ruleId: "R-07", title: "No guaranteed or assured returns", dismissalRate: 0.02, reviews: 64, feedback: [] },
];

/* ── Audit chain helpers ─────────────────────────────────────── */

export const GENESIS_HASH = "0".repeat(64);

export function auditPayload(e: Omit<AuditEntry, "hash">) {
  return [e.prevHash, e.id, e.at, e.actor, e.role, e.action, e.detail, e.ref ?? ""].join("|");
}

export function makeAuditEntry(
  prev: AuditEntry | undefined,
  input: { at: string; actor: string; role: Role | "system"; action: AuditAction; detail: string; ref?: string },
  index: number,
): AuditEntry {
  const prevHash = prev ? prev.hash : GENESIS_HASH;
  const base = { id: `AUD-${String(1000 + index)}`, prevHash, ...input };
  return { ...base, hash: sha256(auditPayload(base)) };
}

export function verifyChain(entries: AuditEntry[]): { ok: boolean; brokenAt?: string } {
  let prev = GENESIS_HASH;
  for (const e of entries) {
    if (e.prevHash !== prev) return { ok: false, brokenAt: e.id };
    const { hash, ...rest } = e;
    if (sha256(auditPayload(rest)) !== hash) return { ok: false, brokenAt: e.id };
    prev = hash;
  }
  return { ok: true };
}

export function seedAudit(): AuditEntry[] {
  const inputs: Parameters<typeof makeAuditEntry>[1][] = [
    { at: "2026-01-01T09:00:00+05:30", actor: "Harini Nair", role: "admin", action: "RULE_PUBLISHED", detail: "Published R-07 v2.0 — No guaranteed or assured returns", ref: "R-07 v2.0" },
    { at: "2026-07-01T09:30:00+05:30", actor: "Harini Nair", role: "admin", action: "FACT_VERSIONED", detail: "F-021 v2 approved (₹4,850 crore); v1 expires 30 Jun 2026", ref: "F-021 v2" },
    { at: DEMO_DRAFT.submittedAt, actor: DEMO_DRAFT.author, role: "creator", action: "DRAFT_SUBMITTED", detail: `Submitted “${DEMO_DRAFT.title}” v${DEMO_DRAFT.version}`, ref: `sha256:${sha256(DEMO_DRAFT.text).slice(0, 12)}` },
  ];
  const out: AuditEntry[] = [];
  inputs.forEach((input, i) => out.push(makeAuditEntry(out[out.length - 1], input, i)));
  return out;
}

export const GLOSSARY_TERMS: { disallowed: string; preferred: string; reason: string; ruleId: string }[] = [
  {
    disallowed: "Guaranteed Scheme",
    preferred: "Market-Linked Growth Portfolio",
    reason: "Statutory prohibition against promising fixed capital outcomes in mutual fund products.",
    ruleId: "R-07 v2.0",
  },
  {
    disallowed: "Risk-Free Wealth",
    preferred: "Disciplined Long-Term Investing",
    reason: "Zero-risk claims violate SEBI advertising standards Clause 7B.",
    ruleId: "R-07 v2.0",
  },
  {
    disallowed: "Fund Guru / Finfluencer",
    preferred: "SEBI-Registered Investment Advisor",
    reason: "Protects institutional brand posture; avoids unregulated influencer connotations.",
    ruleId: "G-08 v1.0",
  },
  {
    disallowed: "Get Rich Quick / Skyrocket",
    preferred: "Compound Wealth Generation",
    reason: "Violates calm, institutional tone guidelines (T-03).",
    ruleId: "T-03 v1.2",
  },
  {
    disallowed: "SIP (without full expansion on first touchpoint)",
    preferred: "Systematic Investment Plan (SIP)",
    reason: "Accessibility for retail first-time investors.",
    ruleId: "G-04 v1.1",
  },
];

export const BRAND_ASSETS: { id: string; name: string; type: "color" | "logo" | "typography" | "boilerplate"; value: string; rule: string }[] = [
  {
    id: "AST-CLR-01",
    name: "Primary Terracotta",
    type: "color",
    value: "#C26043",
    rule: "Use for primary brand accents, key interaction pills, and primary CTAs. Contrast against cream is 5.4:1.",
  },
  {
    id: "AST-CLR-02",
    name: "Charcoal Ink",
    type: "color",
    value: "#1C1A18",
    rule: "Primary text and deep background surfaces. Must meet 4.5:1 minimum WCAG AA contrast ratio.",
  },
  {
    id: "AST-CLR-03",
    name: "Linen Cream Canvas",
    type: "color",
    value: "#EEE9DC",
    rule: "Default canvas background surface across web, email, and social assets.",
  },
  {
    id: "AST-LGO-01",
    name: "Master Logo Clearspace",
    type: "logo",
    value: "24px padding exclusion zone",
    rule: "No text or high-contrast background elements may enter the 24px exclusion zone around the Arthaa emblem.",
  },
  {
    id: "AST-TYP-01",
    name: "Typography Hierarchy",
    type: "typography",
    value: "DM Sans (Display) + Libre Baskerville (Editorial)",
    rule: "DM Sans for titles and navigation; Libre Baskerville italic for quotes and high-craft editorial emphasis.",
  },
  {
    id: "AST-BLR-01",
    name: "Mandatory Market Risk Boilerplate",
    type: "boilerplate",
    value: "Mutual fund investments are subject to market risks, read all scheme related documents carefully.",
    rule: "Mandatory on all customer-facing communications mentioning returns, AUM, or investment portfolios.",
  },
];

export const INITIAL_COMMENTS: { id: string; author: string; role: Role; at: string; text: string }[] = [
  {
    id: "CMT-01",
    author: "Riya Sharma",
    role: "creator",
    at: "2026-11-01T10:45:00+05:30",
    text: "Submitted Diwali hero copy for review. Preserved campaign excitement while emphasizing historical 5-yr returns.",
  },
  {
    id: "CMT-02",
    author: "Arjun Verma",
    role: "reviewer",
    at: "2026-11-01T11:02:00+05:30",
    text: "Flagged the #1 ranking claim: we don't have an unexpired CRISIL certificate for 2026. Suggested softening to 'leading gold savings fund'.",
  },
  {
    id: "CMT-03",
    author: "Priya Sundaram",
    role: "approver",
    at: "2026-11-01T11:15:00+05:30",
    text: "Compliance lock active. Once R-07 and the expired AUM are resolved, I will sign the cryptographic approval certificate.",
  },
];

export const FORMAT_PRESETS = {
  text: DEMO_DRAFT,
  image: {
    id: "draft-visual-banner",
    title: "Diwali Gold Display Banner (1080x1080)",
    brand: "Arthaa Finserv",
    campaign: "Diwali Wealth 2026",
    channel: "Instagram & Meta Display",
    author: "Agency Creative Studio (VFX Hub)",
    submittedAt: "2026-11-01T11:30:00+05:30",
    version: 1,
    imageUrl: "/images/cap-fixes.jpg",
    text: "Celebrate prosperity with guaranteed wealth growth. Arthaa Gold Savings Fund.",
    altText: "", // Intentionally empty to trigger WCAG A-01 accessibility failure!
    contrastRatio: 2.8, // Intentionally 2.8:1 to trigger V-04 contrast failure!
  },
  document: {
    id: "draft-factsheet-pdf",
    title: "Q2 Audited Scheme Factsheet (PDF)",
    brand: "Arthaa Finserv",
    campaign: "Institutional Disclosures Q2 FY27",
    channel: "Regulatory Filing & Website Download",
    author: "Financial Reporting Desk",
    submittedAt: "2026-11-01T09:15:00+05:30",
    version: 1,
    text: "Arthaa Gold Savings Fund Factsheet Q2 FY27. Reported AUM: ₹4,200 crore. Total Expense Ratio: 0.65%. 5-Year CAGR: 11.4%. Riskometer: High.",
  },
};

export const ruleById = (id?: string) => RULES.find((r) => r.id === id);
export const sourceById = (id?: string) => SOURCES.find((s) => s.id === id);
export const currentFact = (id?: string) => FACTS.find((f) => f.id === id && f.status === "current");
