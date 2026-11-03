/**
 * Seeded demo data for the VerityBrand Review Workspace.
 * Demonstrates brand claims governance for NOVA Footwear.
 * Brand, products, test certificates, and claims policies are fictional.
 */
import { sha256 } from "./hash";
import type { AuditAction, AuditEntry, CreativeAssetMetadata, Draft, Fact, Finding, OCRTextRegion, QueueItem, Role, Rule, RuleInsight, Source } from "./types";

export const DEMO_DRAFT: Draft = {
  id: "draft-nova-aerorun",
  title: "NOVA AeroRun X1 — Monsoon Running Campaign",
  brand: "NOVA Footwear",
  campaign: "Monsoon Running Campaign 2026",
  channel: "Paid Social & Product Launch Hero",
  author: "Riya Sharma",
  submittedAt: "2026-11-01T10:42:00+05:30",
  version: 1,
  text: `NOVA AERORUN X1

Built for your fastest miles.

30% lighter than leading running shoes.

Up to 40 km tested durability.

India's #1 running shoe.

Guaranteed to make every run faster.

Now ₹3,999.`,
};

export const RULES: Rule[] = [
  {
    id: "R-01",
    version: "2.0",
    title: "Comparative claims require approved baseline",
    summary: "Comparative claims (such as '% lighter' or 'faster than') require an approved comparison baseline and test methodology.",
    category: "Claims",
    severity: "high",
    status: "in_force",
    effectiveFrom: "2026-10-01",
  },
  {
    id: "R-03",
    version: "1.0",
    title: "Superlative claims require market evidence",
    summary: "‘#1’, ‘best’ or ‘unbeatable’ claims require approved ranking or independent market-share documentation.",
    category: "Claims",
    severity: "high",
    status: "in_force",
    effectiveFrom: "2026-10-01",
  },
  {
    id: "R-04",
    version: "2.1",
    title: "No guaranteed performance promises",
    summary: "Performance claims must reference tested results; content must never state or imply guaranteed speed, performance, or injury prevention.",
    category: "Regulatory",
    severity: "critical",
    status: "in_force",
    effectiveFrom: "2026-10-01",
  },
  {
    id: "R-05",
    version: "1.0",
    title: "Expiry-aware pricing validation",
    summary: "Promotional campaign pricing must be checked against the currently valid pricing source; expired promotional claims must be flagged.",
    category: "Disclosure",
    severity: "high",
    status: "in_force",
    effectiveFrom: "2026-11-01",
  },
  {
    id: "R-07",
    version: "1.0",
    title: "Medical and injury-prevention claims",
    summary: "Medical or injury-prevention claims ('injury-proof', 'prevents injuries') require explicit approved clinical evidence and must not be inferred.",
    category: "Regulatory",
    severity: "critical",
    status: "in_force",
    effectiveFrom: "2026-10-01",
  },
  {
    id: "T-02",
    version: "1.2",
    title: "Athlete-focused brand voice",
    summary: "Confident, energetic, and practical. Avoid exaggerated hype words like 'miracle' or absolute promises.",
    category: "Tone",
    severity: "low",
    status: "in_force",
    effectiveFrom: "2026-10-01",
  },
];

export const SOURCES: Source[] = [
  { id: "SRC-01", title: "01_NOVA_Brand_Guidelines.pdf", fileUri: "/docs/01_NOVA_Brand_Guidelines.pdf", pages: 2, kind: "Brand guideline", issued: "2026-10-01", hash: sha256("SRC-01 01_NOVA_Brand_Guidelines.pdf v2.1") },
  { id: "SRC-02", title: "02_NOVA_Product_Facts.pdf", fileUri: "/docs/02_NOVA_Product_Facts.pdf", pages: 2, kind: "Factsheet", issued: "2026-10-15", hash: sha256("SRC-02 02_NOVA_Product_Facts.pdf v1.0") },
  { id: "SRC-03", title: "03_NOVA_Pricing_Master.pdf", fileUri: "/docs/03_NOVA_Pricing_Master.pdf", pages: 2, kind: "Factsheet", issued: "2026-10-25", hash: sha256("SRC-03 03_NOVA_Pricing_Master.pdf v1.0") },
  { id: "SRC-04", title: "04_NOVA_Approved_Claims.pdf", fileUri: "/docs/04_NOVA_Approved_Claims.pdf", pages: 2, kind: "Regulation", issued: "2026-10-28", hash: sha256("SRC-04 04_NOVA_Approved_Claims.pdf v1.0") },
  { id: "SRC-05", title: "NOVA_AeroRun_Campaign.png", fileUri: "/docs/NOVA_AeroRun_Campaign.png", pages: 1, kind: "Brand guideline", issued: "2026-11-01", hash: sha256("SRC-05 NOVA_AeroRun_Campaign.png") },
];

export const FACTS: Fact[] = [
  { id: "F-01", version: "1", label: "NOVA AeroRun X1 · Weight per shoe", value: "218 g per shoe", validFrom: "2026-10-01", validUntil: "2027-12-31", sourceId: "SRC-02", status: "current" },
  { id: "F-02", version: "1", label: "NOVA AeroRun X1 · Upper material", value: "Engineered mesh", validFrom: "2026-10-01", validUntil: "2027-12-31", sourceId: "SRC-02", status: "current" },
  { id: "F-03", version: "1", label: "NOVA AeroRun X1 · Midsole cushioning", value: "EVA foam (Responsive everyday cushioning)", validFrom: "2026-10-01", validUntil: "2027-12-31", sourceId: "SRC-02", status: "current" },
  { id: "F-04", version: "1", label: "NOVA AeroRun X1 · Outsole", value: "Rubber traction outsole", validFrom: "2026-10-01", validUntil: "2027-12-31", sourceId: "SRC-02", status: "current" },
  { id: "F-05", version: "1", label: "NOVA AeroRun X1 · Tested durability", value: "Up to 40 km tested durability", validFrom: "2026-10-01", validUntil: "2027-12-31", sourceId: "SRC-02", status: "current" },
  { id: "F-06", version: "1", label: "NOVA AeroRun X1 · Available sizes", value: "6, 7, 8, 9, 10, 11", validFrom: "2026-10-01", validUntil: "2027-12-31", sourceId: "SRC-02", status: "current" },
  { id: "F-07", version: "1", label: "NOVA AeroRun X1 · Standard price", value: "₹4,499", validFrom: "2026-10-01", validUntil: "2027-12-31", sourceId: "SRC-03", status: "current" },
  { id: "F-08", version: "1", label: "NOVA AeroRun X1 · Launch campaign price", value: "₹3,999", validFrom: "2026-11-01", validUntil: "2026-11-15", sourceId: "SRC-03", status: "current" },
];

export const DEMO_FINDINGS: Finding[] = [
  {
    id: "FND-1",
    kind: "needs_verification",
    severity: "high",
    phrase: "30% lighter than leading running shoes",
    engine: "grounded_verification",
    title: "Unsupported Comparative Claim",
    why: "Rule R-01 mandates that comparative claims ('% lighter') must cite an approved comparison baseline and testing methodology. The NOVA evidence repository contains no comparative test against named competitors.",
    ruleId: "R-01",
    sourceId: "SRC-02",
    evidence: "Searched 02_NOVA_Product_Facts.pdf & 04_NOVA_Approved_Claims.pdf. Actual shoe weight is certified at 218g per shoe; zero comparative baseline tests found against market competitors.",
    confidence: 0.92,
    confidenceNote: "Strict Abstention: Missing comparison baseline flags 'Needs Verification', never 'False'",
    suggestedFix: "Lightweight performance footwear designed for everyday running",
    intentNote: "Preserves lightweight performance appeal using approved product positioning claim without unverified competitor comparison.",
    status: "open",
    regionId: "ocr-4",
    boundingBox: { x: 5, y: 30, w: 43, h: 9 },
  },
  {
    id: "FND-2",
    kind: "needs_verification",
    severity: "high",
    phrase: "India's #1 running shoe",
    engine: "grounded_verification",
    title: "Unsupported Superlative",
    why: "No approved market ranking, market-share report, or independent consumer panel evidence supporting this claim was found in the NOVA evidence repository.",
    ruleId: "R-03",
    sourceId: "SRC-04",
    evidence: "Searched 04_NOVA_Approved_Claims.pdf Row 4: 'India\'s #1 running shoe' — NOT APPROVED. Zero third-party retail or industry ranking certificates found for '#1' in India.",
    confidence: 0.88,
    confidenceNote: "Evidence absent — abstained from binary true/false verdict",
    suggestedFix: "Designed for everyday running",
    intentNote: "Retains strong athlete-focused positioning without unverified superlative liability.",
    status: "open",
    regionId: "ocr-6",
    boundingBox: { x: 5, y: 51, w: 38, h: 8 },
  },
  {
    id: "FND-3",
    kind: "confirmed_violation",
    severity: "critical",
    phrase: "Guaranteed to make every run faster",
    engine: "rule_engine",
    title: "Unsupported Guaranteed Performance Claim",
    why: "Brand claims policy R-04 strictly prohibits guaranteed speed or performance promises. Content must not imply guarantees where the approved source only supports a limited or tested result.",
    ruleId: "R-04",
    sourceId: "SRC-01",
    evidence: "01_NOVA_Brand_Guidelines.pdf Section 3 (Claims Policy 10): 'Avoid guaranteed performance or guaranteed to make you faster. Content must not imply guarantees where evidence supports tested training.'",
    confidence: 1.0,
    confidenceNote: "Deterministic match against prohibited guarantee rules",
    suggestedFix: "Engineered for responsive everyday training",
    intentNote: "Preserves energetic training focus while replacing non-compliant absolute guarantee with approved product specification.",
    status: "open",
    regionId: "ocr-7",
    boundingBox: { x: 5, y: 61, w: 43, h: 9 },
  },
  {
    id: "FND-4",
    kind: "low_confidence",
    severity: "low",
    phrase: "Now ₹3,999",
    engine: "grounded_verification",
    title: "Time-Bound Promotional Launch Pricing",
    why: "Verified against 03_NOVA_Pricing_Master.pdf. Promotional price ₹3,999 is valid exclusively between 1 Nov 2026 and 15 Nov 2026. Standard retail price is ₹4,499.",
    factId: "F-08",
    sourceId: "SRC-03",
    evidence: "03_NOVA_Pricing_Master.pdf Row 4: Launch campaign price ₹3,999 active (01 Nov 2026 – 15 Nov 2026). Standard retail price ₹4,499.",
    confidence: 0.98,
    confidenceNote: "Temporal ledger check: currently inside valid promotional window",
    suggestedFix: "Now ₹3,999 (Launch offer valid 1–15 Nov 2026)",
    intentNote: "Clarifies promotional validity window to prevent post-expiry consumer disputes.",
    status: "open",
    regionId: "ocr-8",
    boundingBox: { x: 4, y: 77, w: 34, h: 9 },
    isVerified: true,
  },
  {
    id: "FND-5",
    kind: "low_confidence",
    severity: "low",
    phrase: "Up to 40 km tested durability",
    engine: "grounded_verification",
    title: "Grounded Claim Verified: Laboratory Tested Durability",
    why: "Grounded claim verified against 02_NOVA_Product_Facts.pdf and 04_NOVA_Approved_Claims.pdf Row 3.",
    factId: "F-05",
    sourceId: "SRC-02",
    evidence: "02_NOVA_Product_Facts.pdf Performance Evidence Table: 'Up to 40 km tested durability' certified via Performance Test PT-2026-041.",
    confidence: 1.0,
    confidenceNote: "Deterministic match against approved test certificate PT-2026-041",
    suggestedFix: "Up to 40 km tested durability",
    intentNote: "Fully verified claim backed by engineering laboratory test documentation.",
    status: "accepted",
    regionId: "ocr-5",
    boundingBox: { x: 5, y: 41, w: 41, h: 8 },
    isVerified: true,
  },
];

export const DEMO_OCR_REGIONS: OCRTextRegion[] = [
  { id: "ocr-1", text: "NOVA", box: { x: 5, y: 3, w: 20, h: 6 }, confidence: 0.99, status: "neutral" },
  { id: "ocr-2", text: "AERORUN X1", box: { x: 5, y: 11, w: 40, h: 7 }, confidence: 0.99, status: "neutral" },
  { id: "ocr-3", text: "BUILT FOR YOUR FASTEST MILES", box: { x: 5, y: 20, w: 50, h: 5 }, confidence: 0.98, status: "neutral" },
  { id: "ocr-4", text: "30% LIGHTER THAN LEADING RUNNING SHOES", box: { x: 5, y: 30, w: 43, h: 9 }, confidence: 0.97, status: "flagged", findingId: "FND-1", ruleId: "R-01" },
  { id: "ocr-5", text: "UP TO 40 KM TESTED DURABILITY", box: { x: 5, y: 41, w: 41, h: 8 }, confidence: 0.99, status: "verified", findingId: "FND-5", ruleId: "R-02", evidenceRef: "PT-2026-041" },
  { id: "ocr-6", text: "INDIA'S #1 RUNNING SHOE", box: { x: 5, y: 51, w: 38, h: 8 }, confidence: 0.96, status: "flagged", findingId: "FND-2", ruleId: "R-03" },
  { id: "ocr-7", text: "GUARANTEED TO MAKE EVERY RUN FASTER", box: { x: 5, y: 61, w: 43, h: 9 }, confidence: 0.99, status: "flagged", findingId: "FND-3", ruleId: "R-04" },
  { id: "ocr-8", text: "₹3,999", box: { x: 4, y: 77, w: 34, h: 9 }, confidence: 0.98, status: "verified", findingId: "FND-4", ruleId: "R-05", evidenceRef: "03_NOVA_Pricing_Master.pdf" },
  { id: "ocr-9", text: "MONSOON RUNNING CAMPAIGN", box: { x: 5, y: 89, w: 48, h: 6 }, confidence: 0.98, status: "neutral" },
];

export const DEMO_CREATIVE_META: CreativeAssetMetadata = {
  id: "asset-nova-campaign-01",
  fileName: "NOVA_AeroRun_Campaign.png",
  fileUri: "/images/NOVA_AeroRun_Campaign.png",
  dimensions: { width: 1024, height: 1024 },
  aspectRatio: "1:1 Square (Social Feed Placement)",
  altText: "NOVA AeroRun X1 promotional banner featuring lightweight running shoe with 40 km tested durability and launch price ₹3,999.",
  contrastRatio: 10.4,
  contrastStatus: "pass",
  logoClearspace: { top: 31, left: 51, pass: true, minRequiredPx: 24 },
  readabilityGrade: "Grade 8 (High Legibility)",
  uploadedAt: "2026-11-01T10:42:00+05:30",
  version: 1,
};

export const QUEUE: QueueItem[] = [
  { id: "draft-nova-aerorun", title: "NOVA AeroRun X1 — Monsoon Campaign", channel: "Paid social", author: "Riya Sharma", updated: "Today, 10:42", status: "in_review", findings: 4, interactive: true },
  { id: "draft-nova-trail", title: "NOVA TrailGrip — All-Weather Teaser", channel: "Email", author: "Kabir Mehta", updated: "Today, 09:15", status: "queued", findings: 3, interactive: false },
  { id: "draft-nova-cushion", title: "Everyday Cushioning — Carousel Copy", channel: "Instagram", author: "Riya Sharma", updated: "Yesterday", status: "changes_requested", findings: 2, interactive: false },
  { id: "draft-nova-specs", title: "AeroRun X1 — Retail Catalog Sheet", channel: "Web catalog", author: "Meera Iyer", updated: "28 Oct", status: "approved", findings: 1, interactive: false },
];

export const RULE_INSIGHTS: RuleInsight[] = [
  {
    ruleId: "R-01",
    title: "Performance claims must be supported by approved evidence",
    dismissalRate: 0.31,
    reviews: 48,
    flag: "unclear",
    feedback: [
      "Reviewers repeatedly disagree about comparative claims vs baseline.",
      "Need clear test methodology requirement when '% lighter' is mentioned.",
      "Guideline ambiguity: define whether competitor testing requires ISO certification.",
    ],
  },
  { ruleId: "R-03", title: "Superlative claims require market evidence", dismissalRate: 0.19, reviews: 36, feedback: ["Reviewers need clear criteria for regional vs national market claims."] },
  { ruleId: "R-05", title: "Expiry-aware pricing validation", dismissalRate: 0.24, reviews: 52, feedback: ["Social ads scheduled ahead of launch need pre-validation."] },
  { ruleId: "R-04", title: "No guaranteed performance promises", dismissalRate: 0.02, reviews: 64, feedback: [] },
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
    { at: "2026-10-01T09:00:00+05:30", actor: "Harini Nair", role: "admin", action: "RULE_PUBLISHED", detail: "Published R-04 v2.1 — No guaranteed performance promises", ref: "R-04 v2.1" },
    { at: "2026-10-25T09:30:00+05:30", actor: "Harini Nair", role: "admin", action: "FACT_VERSIONED", detail: "F-08 v1 approved (₹3,999 launch price; valid 1–15 Nov 2026)", ref: "F-08 v1" },
    { at: DEMO_DRAFT.submittedAt, actor: DEMO_DRAFT.author, role: "creator", action: "DRAFT_SUBMITTED", detail: `Submitted “${DEMO_DRAFT.title}” v${DEMO_DRAFT.version}`, ref: `sha256:${sha256(DEMO_DRAFT.text).slice(0, 12)}` },
  ];
  const out: AuditEntry[] = [];
  inputs.forEach((input, i) => out.push(makeAuditEntry(out[out.length - 1], input, i)));
  return out;
}

export const GLOSSARY_TERMS: { disallowed: string; preferred: string; reason: string; ruleId: string }[] = [
  {
    disallowed: "Guaranteed Performance / Guaranteed to make you faster",
    preferred: "Designed for Everyday Running",
    reason: "Brand policy prohibits absolute performance guarantees; only tested capabilities may be communicated.",
    ruleId: "R-04 v2.1",
  },
  {
    disallowed: "Injury-Proof / Prevents Injuries",
    preferred: "Responsive Cushioning for Everyday Training",
    reason: "Medical and injury-prevention claims require explicit clinical certification and cannot be inferred.",
    ruleId: "R-07 v1.0",
  },
  {
    disallowed: "India's #1 / World's Best / Unbeatable",
    preferred: "Lightweight Performance Footwear",
    reason: "Superlative claims require independent accredited market-share or ranking documentation.",
    ruleId: "R-03 v1.0",
  },
  {
    disallowed: "Miracle Cushioning",
    preferred: "EVA Foam Cushioning",
    reason: "Avoid exaggerated, unscientific hype words per athlete-focused brand voice.",
    ruleId: "T-02 v1.2",
  },
  {
    disallowed: "Lasts 500 km",
    preferred: "Up to 40 km Tested Durability",
    reason: "Durability claims must strictly match certified laboratory test documentation (Product_Facts.pdf).",
    ruleId: "R-01 v2.0",
  },
];

export const BRAND_ASSETS: { id: string; name: string; type: "color" | "logo" | "typography" | "boilerplate"; value: string; rule: string }[] = [
  {
    id: "AST-CLR-01",
    name: "NOVA Forest Green",
    type: "color",
    value: "#264831",
    rule: "Primary brand accent, verification seals, and primary CTAs. Contrast against cream is 5.8:1.",
  },
  {
    id: "AST-CLR-02",
    name: "Charcoal Carbon",
    type: "color",
    value: "#1C1A18",
    rule: "Primary text and deep background surfaces. Meets 7:1 contrast ratio against light backgrounds.",
  },
  {
    id: "AST-CLR-03",
    name: "Pavement Cream Canvas",
    type: "color",
    value: "#EEE9DC",
    rule: "Default canvas background surface across web, retail catalog, and social assets.",
  },
  {
    id: "AST-LGO-01",
    name: "NOVA Wordmark Clearspace",
    type: "logo",
    value: "24px padding exclusion zone",
    rule: "No text or high-contrast background elements may enter the 24px exclusion zone around the NOVA logo.",
  },
  {
    id: "AST-TYP-01",
    name: "Typography Hierarchy",
    type: "typography",
    value: "DM Sans (Performance Display) + Libre Baskerville (Craft Editorial)",
    rule: "DM Sans for titles and specifications; Libre Baskerville italic for editorial highlights and brand narrative.",
  },
  {
    id: "AST-BLR-01",
    name: "Durability Testing Boilerplate",
    type: "boilerplate",
    value: "Tested durability up to 40 km under standard road running conditions. Individual wear may vary by runner gait and terrain.",
    rule: "Recommended on customer-facing collateral citing product durability or mileage.",
  },
];

export const INITIAL_COMMENTS: { id: string; author: string; role: Role; at: string; text: string }[] = [
  {
    id: "CMT-01",
    author: "Riya Sharma",
    role: "creator",
    at: "2026-11-01T10:45:00+05:30",
    text: "Submitted NOVA AeroRun X1 monsoon campaign draft. Preserved running excitement while highlighting the launch pricing.",
  },
  {
    id: "CMT-02",
    author: "Arjun Verma",
    role: "reviewer",
    at: "2026-11-01T11:02:00+05:30",
    text: "Flagged 'India's #1' and '30% lighter': no comparative test baseline or third-party ranking found in NOVA Product Evidence Repository. Suggested approved product positioning.",
  },
  {
    id: "CMT-03",
    author: "Priya Sundaram",
    role: "approver",
    at: "2026-11-01T11:15:00+05:30",
    text: "Compliance lock active. Once R-01, R-03, and R-04 are resolved against Product_Facts.pdf, I will sign and seal the cryptographic approval certificate.",
  },
];

export const FORMAT_PRESETS = {
  text: DEMO_DRAFT,
  image: {
    id: "draft-visual-banner",
    title: "NOVA AeroRun X1 — Launch Social Banner (1080x1080)",
    brand: "NOVA Footwear",
    campaign: "Monsoon Running Campaign 2026",
    channel: "Instagram & Meta Display",
    author: "Agency Creative Studio (VFX Hub)",
    submittedAt: "2026-11-01T11:30:00+05:30",
    version: 1,
    imageUrl: "/images/cap-fixes.jpg",
    text: `NOVA AERORUN X1
BUILT FOR YOUR FASTEST MILES
30% LIGHTER
UP TO 40 KM TESTED DURABILITY
INDIA'S #1 RUNNING SHOE
₹3,999`,
    altText: "", // Intentionally empty to trigger WCAG A-01 accessibility failure!
    contrastRatio: 2.8, // Intentionally 2.8:1 to trigger V-04 contrast failure!
  },
  document: {
    id: "draft-product-facts-pdf",
    title: "NOVA AeroRun X1 — Product Specifications & Factsheet (PDF)",
    brand: "NOVA Footwear",
    campaign: "Product Launch Governance Q4 2026",
    channel: "Product Master & Catalog Ingestion",
    author: "Product Engineering Desk",
    submittedAt: "2026-11-01T09:15:00+05:30",
    version: 1,
    text: "NOVA AeroRun X1 Product Facts Sheet. Weight: 218g per shoe. Upper: Engineered mesh. Midsole: EVA foam. Outsole: Rubber traction outsole. Tested durability: Up to 40 km. Standard Price: ₹4,499. Campaign Price: ₹3,999 (Valid: 1 Nov – 15 Nov 2026). Available Sizes: 6, 7, 8, 9, 10, 11.",
  },
};

export const ruleById = (id?: string) => RULES.find((r) => r.id === id);
export const sourceById = (id?: string) => SOURCES.find((s) => s.id === id);
export const currentFact = (id?: string) => FACTS.find((f) => f.id === id && f.status === "current");
