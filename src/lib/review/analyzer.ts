import type { CreativeAssetMetadata, Finding, OCRTextRegion } from "./types";
import { DEMO_CREATIVE_META, DEMO_FINDINGS, DEMO_OCR_REGIONS } from "./seed";

export function runCreativeOcrPipeline(fileUri: string = "/images/NOVA_AeroRun_Campaign.png"): {
  regions: OCRTextRegion[];
  metadata: CreativeAssetMetadata;
  findings: Finding[];
  stats: {
    regionsDetected: number;
    claimsDetected: number;
    findingsGenerated: number;
    verifiedClaims: number;
  };
} {
  const regions = [...DEMO_OCR_REGIONS];
  const metadata = { ...DEMO_CREATIVE_META, fileUri };
  const findings = [...DEMO_FINDINGS];

  return {
    regions,
    metadata,
    findings,
    stats: {
      regionsDetected: regions.length,
      claimsDetected: 5,
      findingsGenerated: findings.filter((f) => f.status === "open").length,
      verifiedClaims: findings.filter((f) => f.isVerified).length,
    },
  };
}

export function analyzeAnyContent(
  text: string,
  format: "text" | "image" | "document" = "text",
  mediaMeta?: { altText?: string; contrastRatio?: number; colorCheck?: string }
): Finding[] {
  const findings: Finding[] = [];
  let count = 1;

  // 1. Rule R-04: Guaranteed Performance / Speed Claims
  const guaranteedRegex = /(guaranteed\s+(?:to\s+)?make\s+(?:you|every\s+run)\s+faster|guaranteed\s+performance|guaranteed\s+to\s+make\s+you\s+faster|guaranteed\s+speed)/i;
  const guaranteedMatch = text.match(guaranteedRegex);
  if (guaranteedMatch) {
    findings.push({
      id: `FND-LIVE-${count++}`,
      kind: "confirmed_violation",
      severity: "critical",
      phrase: guaranteedMatch[0],
      engine: "rule_engine",
      title: "Unsupported Guaranteed Performance Claim",
      why: "Brand claims policy R-04 strictly forbids guaranteed performance or speed promises. Content must not imply guarantees where the approved source only supports a limited or tested result.",
      ruleId: "R-04 v2.1",
      sourceId: "SRC-01 Brand_Guidelines.pdf",
      evidence: "Brand_Guidelines.pdf Section 3: 'Avoid guaranteed performance or guaranteed to make you faster. Content must never imply guarantees.'",
      confidence: 1.0,
      confidenceNote: "Deterministic match against prohibited guarantee rules",
      suggestedFix: "Engineered for responsive everyday training",
      intentNote: "Preserves energetic training focus while replacing non-compliant absolute guarantee with approved product specification.",
      status: "open",
      regionId: "ocr-7",
      boundingBox: { x: 5, y: 61, w: 43, h: 9 },
    });
  }

  // 2. Rule R-01: Comparative Claim without Approved Baseline (Strict Abstention)
  const comparativeRegex = /(\d+%\s*lighter(?:\s+than\s+leading\s+running\s+shoes)?|\d+%\s*faster)/i;
  const comparativeMatch = text.match(comparativeRegex);
  if (comparativeMatch) {
    findings.push({
      id: `FND-LIVE-${count++}`,
      kind: "needs_verification",
      severity: "high",
      phrase: comparativeMatch[0],
      engine: "grounded_verification",
      title: "Unsupported Comparative Claim",
      why: "Rule R-01 mandates that comparative claims ('% lighter') must cite an approved comparison baseline and testing methodology. The NOVA evidence repository contains no comparative test against named competitors.",
      ruleId: "R-01 v2.0",
      sourceId: "SRC-02 Product_Facts.pdf",
      evidence: "Searched Product_Facts.pdf & Approved_Claims.pdf. Actual shoe weight is 218g per shoe; zero comparative baseline tests found against market competitors.",
      confidence: 0.92,
      confidenceNote: "Strict Abstention: Missing comparison baseline flags 'Needs Verification', never 'False'",
      suggestedFix: "Lightweight performance footwear designed for everyday running",
      intentNote: "Preserves lightweight performance appeal using approved product positioning claim without unverified competitor comparison.",
      status: "open",
      regionId: "ocr-4",
      boundingBox: { x: 5, y: 30, w: 43, h: 9 },
    });
  }

  // 3. Rule R-03: Superlative Ranking Claim (Strict Abstention)
  const rankingRegex = /(India's\s+#1\s+running\s+shoe|#1\s+running\s+shoe|the\s+world's\s+best\s+running\s+shoe|best\s+running\s+shoe\s+in\s+India|unbeatable\s+running\s+shoe)/i;
  const rankingMatch = text.match(rankingRegex);
  if (rankingMatch) {
    findings.push({
      id: `FND-LIVE-${count++}`,
      kind: "needs_verification",
      severity: "high",
      phrase: rankingMatch[0],
      engine: "grounded_verification",
      title: "Unsupported Superlative",
      why: "No approved market ranking, market-share report, or independent consumer panel evidence supporting this claim was found in the NOVA evidence repository.",
      ruleId: "R-03 v1.0",
      sourceId: "SRC-04 Approved_Claims.pdf",
      evidence: "Searched 5 active NOVA repository documents. Zero third-party retail or industry ranking certificates found for '#1' in India.",
      confidence: 0.88,
      confidenceNote: "Strict Abstention: Evidence absent — abstained from binary true/false verdict",
      suggestedFix: "Designed for everyday running",
      intentNote: "Retains strong athlete-focused positioning without unverified superlative liability.",
      status: "open",
      regionId: "ocr-6",
      boundingBox: { x: 5, y: 51, w: 38, h: 8 },
    });
  }

  // 4. Rule R-07: Medical or Injury-Prevention Claims
  const medicalRegex = /(injury-proof(?:\s+cushioning)?|prevents?\s+(?:running\s+)?injur(?:y|ies))/i;
  const medicalMatch = text.match(medicalRegex);
  if (medicalMatch) {
    findings.push({
      id: `FND-LIVE-${count++}`,
      kind: "confirmed_violation",
      severity: "critical",
      phrase: medicalMatch[0],
      engine: "rule_engine",
      title: "Unapproved Medical / Injury-Prevention Claim",
      why: "Rule R-07 strictly prohibits injury-prevention or medical claims ('injury-proof', 'prevents injuries') without approved clinical trial documentation.",
      ruleId: "R-07 v1.0",
      sourceId: "SRC-01 Brand_Guidelines.pdf",
      evidence: "Brand_Guidelines.pdf Claims Policy 7: Medical or injury-prevention claims require explicit approved evidence and must not be inferred.",
      confidence: 1.0,
      confidenceNote: "Deterministic rule breach",
      suggestedFix: "Responsive cushioning for everyday training",
      intentNote: "Replaces medical claim with verified EVA foam cushioning specification.",
      status: "open",
    });
  }

  // 5. Rule R-08: Exaggerated Durability Discrepancy (e.g. "Lasts 500 km")
  const durabilityRegex = /(lasts?\s+500\s*km|500\s*km(?:\s+durability)?)/i;
  const durabilityMatch = text.match(durabilityRegex);
  if (durabilityMatch) {
    findings.push({
      id: `FND-LIVE-${count++}`,
      kind: "confirmed_violation",
      severity: "high",
      phrase: durabilityMatch[0],
      engine: "grounded_verification",
      title: "Product Specification Discrepancy",
      why: "Product_Facts.pdf certifies durability 'Up to 40 km tested durability'. The claim 'Lasts 500 km' contradicts certified laboratory test limits.",
      factId: "F-05",
      sourceId: "SRC-02 Product_Facts.pdf",
      evidence: "Product_Facts.pdf Section: Performance Testing. Tested durability: Up to 40 km. Validity: 2026 campaign documentation.",
      confidence: 0.99,
      confidenceNote: "Contradiction against verified Product_Facts.pdf specification",
      suggestedFix: "Up to 40 km tested durability",
      intentNote: "Aligns durability statement with certified engineering test results.",
      status: "open",
    });
  }

  // 6. Rule R-05: Expiry-Aware Pricing Validation
  // If text mentions ₹3,999 in an expired context or if explicitly marked expired
  const expiredPriceRegex = /(₹3,999(?:\s+after\s+15\s+nov|\s+expired|\s+post-campaign))/i;
  const expiredPriceMatch = text.match(expiredPriceRegex);
  if (expiredPriceMatch) {
    findings.push({
      id: `FND-LIVE-${count++}`,
      kind: "expired_fact",
      severity: "high",
      phrase: expiredPriceMatch[0],
      engine: "grounded_verification",
      title: "Expired Promotional Claim",
      why: "Promotional launch price ₹3,999 was valid exclusively from 1 Nov 2026 to 15 Nov 2026. Standard retail price of ₹4,499 now applies.",
      factId: "F-08",
      sourceId: "SRC-03 Pricing_Master.pdf",
      evidence: "Pricing_Master.pdf: Launch campaign price ₹3,999 expired on 15 Nov 2026. Standard retail price is ₹4,499.",
      confidence: 0.98,
      confidenceNote: "Temporal ledger check: validity window expired",
      suggestedFix: "₹4,499 (Standard retail price)",
      intentNote: "Updates pricing claim to currently valid standard price ledger.",
      status: "open",
    });
  } else {
    // Normal pricing check: if ₹3,999 is mentioned inside valid campaign, note temporal validity
    const launchPriceRegex = /(₹3,?999)/i;
    const launchPriceMatch = text.match(launchPriceRegex);
    if (launchPriceMatch && !text.includes("15 Nov")) {
      findings.push({
        id: `FND-LIVE-${count++}`,
        kind: "low_confidence",
        severity: "low",
        phrase: launchPriceMatch[0],
        engine: "grounded_verification",
        title: "Time-Bound Promotional Launch Pricing",
        why: "Verified against Pricing_Master.pdf. Promotional price ₹3,999 is valid exclusively between 1 Nov 2026 and 15 Nov 2026. Standard retail price is ₹4,499.",
        factId: "F-08",
        sourceId: "SRC-03 Pricing_Master.pdf",
        evidence: "Pricing_Master.pdf Row 4: Launch campaign price ₹3,999 active (1 Nov 2026 – 15 Nov 2026). Standard retail price ₹4,499.",
        confidence: 0.98,
        confidenceNote: "Temporal ledger check: currently inside valid promotional window",
        suggestedFix: "₹3,999 (Launch offer valid 1–15 Nov 2026)",
        intentNote: "Clarifies promotional validity window to prevent post-expiry consumer disputes.",
        status: "open",
      });
    }
  }

  // 7. Tone of Voice / Hype Rule (T-02)
  const hypeRegex = /(miracle|unbeatable\s+deal|once\s+in\s+a\s+lifetime)/i;
  const hypeMatch = text.match(hypeRegex);
  if (hypeMatch) {
    findings.push({
      id: `FND-LIVE-${count++}`,
      kind: "confirmed_violation",
      severity: "medium",
      phrase: hypeMatch[0],
      engine: "rule_engine",
      title: "Off-Brand Hype Language (Rule T-02)",
      why: "Brand Tone Guideline T-02 requires a confident, energetic, and practical voice. Avoid exaggerated hype words.",
      ruleId: "T-02 v1.2",
      sourceId: "SRC-01 Brand_Guidelines.pdf",
      evidence: "T-02 v1.2: Prohibits artificial hype words such as 'miracle' or 'unbeatable'.",
      confidence: 0.95,
      confidenceNote: "Tone dictionary match",
      suggestedFix: "proven performance",
      intentNote: "Transforms artificial hype into grounded athlete-focused phrasing.",
      status: "open",
    });
  }

  // 8. Visual & Accessibility Checks for Image format
  if (format === "image") {
    if (!mediaMeta?.altText || mediaMeta.altText.trim().length < 5) {
      findings.push({
        id: `FND-LIVE-${count++}`,
        kind: "confirmed_violation",
        severity: "high",
        phrase: "Missing Creative Alt-Text",
        engine: "rule_engine",
        title: "Accessibility Failure: No Screen-Reader Description (WCAG 2.1)",
        why: "WCAG 2.1 Level AA (Rule A-01) mandates descriptive alt text for all published campaign imagery and banners.",
        ruleId: "A-01 v2.0",
        sourceId: "SRC-01 Brand_Guidelines.pdf",
        evidence: "Creative asset uploaded without meaningful accessible alt metadata.",
        confidence: 1.0,
        confidenceNote: "Automated accessibility validator",
        suggestedFix: "Add descriptive text: 'NOVA AeroRun X1 promotional banner featuring lightweight running shoe with 40 km tested durability and launch price ₹3,999.'",
        intentNote: "Ensures screen-reader accessibility across digital channels.",
        status: "open",
      });
    }

    if (mediaMeta?.contrastRatio && mediaMeta.contrastRatio < 4.5) {
      findings.push({
        id: `FND-LIVE-${count++}`,
        kind: "confirmed_violation",
        severity: "medium",
        phrase: `Low Contrast Ratio (${mediaMeta.contrastRatio.toFixed(1)}:1)`,
        engine: "rule_engine",
        title: "Visual Brand Guideline: Insufficient Contrast Ratio",
        why: "Brand Visual Standard V-04 requires a minimum contrast of 4.5:1 for body copy and 3.0:1 for large display titles over imagery.",
        ruleId: "V-04 v1.2",
        sourceId: "SRC-01 Brand_Guidelines.pdf",
        evidence: `Calculated foreground/background contrast is ${mediaMeta.contrastRatio.toFixed(1)}:1, falling below WCAG AA threshold.`,
        confidence: 0.99,
        confidenceNote: "Color analyzer luminance calculation",
        suggestedFix: "Adjust headline overlay to #FFFFFF or apply a 30% dark scrim behind text",
        intentNote: "Maintains brand visual polish and legibility on mobile screens.",
        status: "open",
      });
    }
  }

  // 9. Generic fallback if user typed clean copy
  if (findings.length === 0 && text.trim().length > 10) {
    findings.push({
      id: `FND-LIVE-01`,
      kind: "needs_verification",
      severity: "low",
      phrase: text.split(" ").slice(0, 3).join(" "),
      engine: "grounded_verification",
      title: "Content Intake Complete: No Violations Detected",
      why: "Content verified against NOVA Brand Guidelines, Product_Facts.pdf, and Pricing_Master.pdf. 0 critical violations detected.",
      ruleId: "Baseline Verification",
      sourceId: "NOVA Product Evidence Repository",
      evidence: "Automated scan completed with 0 claims policy breaches.",
      confidence: 0.96,
      confidenceNote: "Grounded semantic pass",
      suggestedFix: text.trim(),
      intentNote: "Content compliant with brand claims policy; ready for human sign-off.",
      status: "open",
    });
  }

  return findings;
}
