export type FindingSeverity = "critical" | "high" | "medium" | "low";
export type FindingCategory =
  | "Confirmed violation"
  | "Expired fact"
  | "Needs verification"
  | "Low confidence";

export type FindingStatus = "pending" | "accepted" | "edited" | "dismissed";

export interface FindingRecord {
  id: string;
  number: number;
  category: FindingCategory;
  severity: FindingSeverity;
  targetPhrase: string;
  replacementPhrase: string;
  ruleOrFactId: string;
  ruleVersion: string;
  evidenceId: string;
  sourceName: string;
  confidence: number;
  whyExplanation: string;
  fixInstruction: string;
  intentNote: string;
  status: FindingStatus;
  decidedBy?: string;
  decidedAt?: string;
  dismissReason?: string;
  customEdit?: string;
  span: [number, number];
  checkType: "rule" | "fact_expiry" | "claim_retrieval" | "tone_ai";
}

export interface CampaignDraft {
  id: string;
  brand: string;
  campaign: string;
  title: string;
  version: string;
  channel: string;
  author: string;
  submittedAt: string;
  reviewerName: string;
  reviewerInitials: string;
  originalText: string;
  findings: FindingRecord[];
}

export interface BrandRule {
  id: string;
  version: string;
  category: "Regulatory" | "Terminology" | "Tone & Voice" | "Disclaimers";
  title: string;
  description: string;
  bannedTerms?: string[];
  requiredPhrase?: string;
  updatedAt: string;
  status: "active" | "under_review";
}

export interface FactLedgerEntry {
  id: string;
  metric: string;
  approvedValue: string;
  scope: string;
  sourceDoc: string;
  validUntil: string;
  isExpired: boolean;
  owner: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: "ACCEPT_FIX" | "EDIT_FIX" | "DISMISS_FINDING" | "APPROVE_ASSET" | "SCAN_INITIATED" | "REQUEST_CHANGES";
  findingId?: string;
  ruleOrFactRef?: string;
  summary: string;
  versionTag: string;
}

export const INITIAL_CAMPAIGN_DRAFTS: CampaignDraft[] = [
  {
    id: "draft-gsf-v2",
    brand: "Arthaa Finserv",
    campaign: "Q4 Campaign",
    title: "Gold Savings Fund Launch Copy",
    version: "v2",
    channel: "Paid Social & Landing Hero",
    author: "Riya Sharma (Growth Copywriter)",
    submittedAt: "2026-10-27 14:18 IST",
    reviewerName: "Arjun M.",
    reviewerInitials: "AM",
    originalText:
      "Grow your wealth with guaranteed 12% returns from the Arthaa Gold Savings Fund, India's #1 fund managing Rs 4,200 crore. Start a SIP today and build a habit that grows with you.",
    findings: [
      {
        id: "F-0412",
        number: 1,
        category: "Confirmed violation",
        severity: "critical",
        targetPhrase: "guaranteed 12% returns",
        replacementPhrase: "long-term, market-linked investing*",
        ruleOrFactId: "Rule R-07",
        ruleVersion: "v3.0",
        evidenceId: "E-014",
        sourceName: "SEBI Mutual Fund Ad Code & Brand Rules v3.0",
        confidence: 1.0,
        whyExplanation:
          "Rule R-07 v3.0 strictly prohibits promising fixed or 'guaranteed' percentage returns on market-linked mutual fund schemes.",
        fixInstruction:
          'Replace with "long-term, market-linked investing*" and append standard KIM risk disclaimer.',
        intentNote:
          "Intent kept: growth appeal. Nothing is applied until the reviewer or creator accepts.",
        status: "pending",
        span: [22, 44],
        checkType: "rule",
      },
      {
        id: "F-0413",
        number: 2,
        category: "Expired fact",
        severity: "medium",
        targetPhrase: "Rs 4,200 crore",
        replacementPhrase: "Rs 4,850 crore (Q3 FY26 audited AUM)",
        ruleOrFactId: "Fact F-021",
        ruleVersion: "v2.4",
        evidenceId: "E-089",
        sourceName: "Finance Fact Ledger (Q2-Q3 FY26)",
        confidence: 0.99,
        whyExplanation:
          "Fact F-021 (AUM = Rs 4,200 crore) was valid until 30 Jun 2026. The validity extension has lapsed; Q3 audited figure is Rs 4,850 crore.",
        fixInstruction:
          "Update to current Q3 FY26 audited AUM figure (Rs 4,850 crore) from Finance Fact Ledger F-021 v2.4.",
        intentNote:
          "Intent kept: scale & institutional trust proof point with current verified AUM.",
        status: "pending",
        span: [105, 119],
        checkType: "fact_expiry",
      },
      {
        id: "F-0414",
        number: 3,
        category: "Needs verification",
        severity: "high",
        targetPhrase: "India's #1 fund",
        replacementPhrase: "a leading domestic gold savings fund",
        ruleOrFactId: "No approved source",
        ruleVersion: "KIM-2026",
        evidenceId: "NONE",
        sourceName: "Approved Sources & KIM Repository",
        confidence: 0.94,
        whyExplanation:
          "No approved Morningstar/CRISIL ranking citation found in the Brand Brain supporting '#1 fund' across all categories. Abstaining from false verdict — flagged for verification.",
        fixInstruction:
          "Attach an approved CRISIL/Morningstar Q3 citation ID or replace the unverified superlative.",
        intentNote:
          "Intent kept: strong category positioning without unsubstantiated #1 ranking risk.",
        status: "pending",
        span: [80, 95],
        checkType: "claim_retrieval",
      },
      {
        id: "F-0415",
        number: 4,
        category: "Low confidence",
        severity: "low",
        targetPhrase: "Grow your wealth",
        replacementPhrase: "Build steady wealth",
        ruleOrFactId: "Tone rule T-03",
        ruleVersion: "v1.2",
        evidenceId: "E-102",
        sourceName: "Arthaa Tone & Voice Guidelines v1.2",
        confidence: 0.68,
        whyExplanation:
          'Possible mismatch with the "calm, plain-spoken, habit-oriented" tone guideline T-03 when paired with aggressive return hooks.',
        fixInstruction:
          'Optional: soften opening hook to "Build steady wealth" or dismiss if contextually appropriate once R-07 is resolved.',
        intentNote:
          "Intent kept: aspirational opening aligned with Arthaa's calm financial stewardship voice.",
        status: "pending",
        span: [0, 16],
        checkType: "tone_ai",
      },
    ],
  },
  {
    id: "draft-elss-v1",
    brand: "Arthaa Finserv",
    campaign: "Q4 Campaign",
    title: "Tax Saver ELSS Direct Mailer",
    version: "v1",
    channel: "Email & CRM Newsletter",
    author: "Kabir Verma (Product Marketing)",
    submittedAt: "2026-10-27 11:05 IST",
    reviewerName: "Arjun M.",
    reviewerInitials: "AM",
    originalText:
      "Save up to Rs 1,50,000 in tax instantly with zero risk in the Arthaa Tax Shield ELSS Fund, beating 99% of peers since 2021 with a 1-year lock-in period.",
    findings: [
      {
        id: "F-0501",
        number: 1,
        category: "Confirmed violation",
        severity: "critical",
        targetPhrase: "with zero risk",
        replacementPhrase: "through disciplined equity allocation*",
        ruleOrFactId: "Rule R-02",
        ruleVersion: "v3.1",
        evidenceId: "E-004",
        sourceName: "SEBI Risk-O-Meter Mandate v3.1",
        confidence: 1.0,
        whyExplanation:
          "ELSS schemes carry a 'Very High' Risk-o-meter rating. Claiming 'zero risk' is a critical regulatory violation under Rule R-02.",
        fixInstruction:
          'Remove "zero risk" and state "through disciplined equity allocation*" with standard risk-o-meter disclosure.',
        intentNote: "Intent kept: confidence in systematic tax planning without misleading risk claims.",
        status: "pending",
        span: [45, 59],
        checkType: "rule",
      },
      {
        id: "F-0502",
        number: 2,
        category: "Confirmed violation",
        severity: "high",
        targetPhrase: "1-year lock-in period",
        replacementPhrase: "statutory 3-year ELSS lock-in period",
        ruleOrFactId: "Fact F-009",
        ruleVersion: "v1.0",
        evidenceId: "E-031",
        sourceName: "ELSS Product Fact Sheet (Section 80C)",
        confidence: 0.98,
        whyExplanation:
          "Fact F-009 specifies that Equity Linked Savings Schemes (ELSS) have a mandatory 3-year lock-in period under Section 80C, not 1 year.",
        fixInstruction: 'Correct lock-in duration from "1-year" to "statutory 3-year ELSS lock-in period".',
        intentNote: "Intent kept: clarity on lock-in horizon with accurate statutory period.",
        status: "pending",
        span: [130, 151],
        checkType: "rule",
      },
      {
        id: "F-0503",
        number: 3,
        category: "Needs verification",
        severity: "medium",
        targetPhrase: "beating 99% of peers since 2021",
        replacementPhrase: "delivering top-quartile category performance since 2021 (Source: CRISIL Q3)",
        ruleOrFactId: "Fact F-034",
        ruleVersion: "v2.0",
        evidenceId: "E-077",
        sourceName: "Benchmark Performance Ledger Q3",
        confidence: 0.91,
        whyExplanation:
          "Approved Fact F-034 certifies top-quartile (top 25%) CRISIL rank over 5 years, not '99% of peers'.",
        fixInstruction: "Align peer comparison with verified CRISIL Q3 top-quartile citation.",
        intentNote: "Intent kept: strong historical outperformance backed by CRISIL benchmark.",
        status: "pending",
        span: [91, 122],
        checkType: "claim_retrieval",
      },
    ],
  },
];

export const BRAND_RULES: BrandRule[] = [
  {
    id: "Rule R-07",
    version: "v3.0",
    category: "Regulatory",
    title: "No Guaranteed or Assured Return Claims",
    description:
      "Mutual fund and market-linked products must never state or imply guaranteed, assured, fixed, or risk-free percentage returns.",
    bannedTerms: ["guaranteed 12% returns", "guaranteed returns", "assured profit", "100% safe returns", "zero risk"],
    requiredPhrase: "Mutual Fund investments are subject to market risks, read all scheme related documents carefully.",
    updatedAt: "2026-09-15",
    status: "active",
  },
  {
    id: "Rule R-02",
    version: "v3.1",
    category: "Regulatory",
    title: "Risk-O-Meter & Principal Safety Accuracy",
    description:
      "Equity and Gold funds cannot be described as 'zero risk' or 'capital protected'. Risk level must match the latest monthly KIM disclosure.",
    bannedTerms: ["zero risk", "risk-free", "no downside", "guaranteed principal"],
    updatedAt: "2026-10-01",
    status: "active",
  },
  {
    id: "Rule R-11",
    version: "v2.0",
    category: "Disclaimers",
    title: "Superlative & #1 Ranking Substantiation",
    description:
      "Any claim of '#1', 'Best', or 'Leading' must cite an active, non-expired CRISIL or Morningstar report ID with exact category and date range.",
    bannedTerms: ["India's #1 fund", "best fund in India", "unbeatable returns"],
    updatedAt: "2026-08-20",
    status: "active",
  },
  {
    id: "Tone rule T-03",
    version: "v1.2",
    category: "Tone & Voice",
    title: "Calm, Plain-Spoken Stewardship Voice",
    description:
      "Avoid hype-driven wealth promises ('get rich', 'explosive wealth'). Emphasize steady habits, long-term discipline, and transparent stewardship.",
    bannedTerms: ["get rich quick", "explosive wealth", "guaranteed jackpot"],
    updatedAt: "2026-07-12",
    status: "under_review",
  },
];

export const FACT_LEDGER: FactLedgerEntry[] = [
  {
    id: "Fact F-021",
    metric: "Arthaa Gold Savings Fund — Total AUM",
    approvedValue: "Rs 4,850 crore (Q3 FY26) — [Previous: Rs 4,200 crore]",
    scope: "Gold Savings Fund collateral",
    sourceDoc: "Audited Q3 Fund Fact Sheet (E-089)",
    validUntil: "2026-06-30 (Lapsed — Refreshed v2.4 available)",
    isExpired: true,
    owner: "Finance & Fund Accounting",
  },
  {
    id: "Fact F-009",
    metric: "Arthaa Tax Shield ELSS — Statutory Lock-In",
    approvedValue: "3 Years from unit allotment date",
    scope: "ELSS Section 80C Campaigns",
    sourceDoc: "SEBI ELSS Scheme Information Document (E-031)",
    validUntil: "2027-03-31",
    isExpired: false,
    owner: "Legal & Compliance",
  },
  {
    id: "Fact F-034",
    metric: "ELSS 5-Year Peer Percentile Rank",
    approvedValue: "Top Quartile (88th Percentile, CRISIL Q3 2026)",
    scope: "Performance Comparison Ads",
    sourceDoc: "CRISIL Mutual Fund Ranking Q3 2026 (E-077)",
    validUntil: "2026-12-31",
    isExpired: false,
    owner: "Product Research",
  },
  {
    id: "Fact F-042",
    metric: "Minimum Monthly SIP Amount (Gold Savings)",
    approvedValue: "Rs 500 per month",
    scope: "Retail Onboarding & Social Copy",
    sourceDoc: "KIM Oct 2026 Addendum (E-112)",
    validUntil: "2027-06-30",
    isExpired: false,
    owner: "Retail Product Ops",
  },
];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: "AUD-904",
    timestamp: "2026-10-27 14:18:22",
    actor: "System (VerityBrand Engine)",
    role: "Deterministic + Grounded AI",
    action: "SCAN_INITIATED",
    ruleOrFactRef: "Rules v3.0 / Ledger FY26",
    summary:
      "Scanned 'Gold Savings Fund Launch Copy v2'. Detected 4 findings (1 Critical violation, 1 Expired fact, 1 Unverified claim, 1 Tone flag).",
    versionTag: "v2",
  },
  {
    id: "AUD-903",
    timestamp: "2026-10-26 17:42:10",
    actor: "Arjun M.",
    role: "Compliance Reviewer",
    action: "DISMISS_FINDING",
    findingId: "F-0119",
    ruleOrFactRef: "Tone rule T-03 v1.2",
    summary:
      "Dismissed low-confidence tone alert on Q3 SIP Educational Carousel. Note: 'Rule T-03 phrasing around \"Grow your wealth\" needs clearer exception for educational headlines.'",
    versionTag: "v1",
  },
  {
    id: "AUD-902",
    timestamp: "2026-10-25 11:15:04",
    actor: "Harini N.",
    role: "Brand Governance Lead",
    action: "APPROVE_ASSET",
    ruleOrFactRef: "All 3 findings resolved",
    summary:
      "Approved 'Festive Sovereign Gold Comparative Guide v3' with locked evidence snapshot [E-014, E-089]. Ready for publishing.",
    versionTag: "v3-locked",
  },
];
