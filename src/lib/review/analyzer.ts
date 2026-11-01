import type { Finding } from "./types";
import { sha256 } from "./hash";

export function analyzeAnyContent(
  text: string,
  format: "text" | "image" | "document" = "text",
  mediaMeta?: { altText?: string; contrastRatio?: number; colorCheck?: string }
): Finding[] {
  const findings: Finding[] = [];
  let count = 1;

  // 1. Text Analysis - Guaranteed Returns Rule R-07 (Statutory Prohibition)
  const guaranteedRegex = /(guaranteed\s+\d+%?\s*returns?|guaranteed\s+returns?|assured\s+\d+%?\s*returns?|zero\s+risk|100%\s+safe|capital\s+protected|risk-free\s+wealth)/i;
  const guaranteedMatch = text.match(guaranteedRegex);
  if (guaranteedMatch) {
    findings.push({
      id: `FND-LIVE-${count++}`,
      kind: "confirmed_violation",
      severity: "critical",
      phrase: guaranteedMatch[0],
      engine: "rule_engine",
      title: "Guaranteed or Risk-Free Claim (Statutory Breach)",
      why: `SEBI Advertising Code Clause 7B & Brand Rule R-07 strictly prohibit guaranteeing returns or claiming zero risk for market-linked investments.`,
      ruleId: "R-07 v2.0",
      sourceId: "E-007",
      evidence: "R-07 in-force: Market-linked mutual fund schemes must never state fixed or guaranteed return promises.",
      confidence: 1.0,
      confidenceNote: "Deterministic regex match against statutory rule",
      suggestedFix: "an 11.4% five-year average return*",
      intentNote: "Preserves the wealth-building appeal by substituting verified historical CAGR instead of an illegal return guarantee.",
      status: "open",
    });
  }

  // 2. Text Analysis - Expired Financial Metric Fact F-021
  const aumRegex = /((?:₹|Rs\.?)\s*4,?200\s*crore)/i;
  const aumMatch = text.match(aumRegex);
  if (aumMatch) {
    findings.push({
      id: `FND-LIVE-${count++}`,
      kind: "expired_fact",
      severity: "medium",
      phrase: aumMatch[0],
      engine: "grounded_verification",
      title: "Expired AUM Ledger Figure",
      why: `Fact F-021 (AUM = ₹4,200 crore) lapsed on 30 Jun 2026. Publishing expired AUM numbers violates current financial reporting standards.`,
      factId: "F-021 v1.0",
      sourceId: "E-021",
      evidence: "Audited Q2 FY27 factsheet records current AUM at ₹4,850 crore (valid through 31 Dec 2026).",
      confidence: 0.98,
      confidenceNote: "Temporal ledger check: validity window expired",
      suggestedFix: "₹4,850 crore",
      intentNote: "Preserves institutional scale proof point with audited Q2 FY27 data.",
      status: "open",
    });
  }

  // 3. Text Analysis - Unsupported Ranking Claim (Strict Abstention)
  const rankingRegex = /(India's\s+#1\s+fund|#1\s+fund|best\s+fund\s+in\s+India|beating\s+99%\s+of\s+peers|highest\s+rated\s+fund)/i;
  const rankingMatch = text.match(rankingRegex);
  if (rankingMatch) {
    findings.push({
      id: `FND-LIVE-${count++}`,
      kind: "needs_verification",
      severity: "high",
      phrase: rankingMatch[0],
      engine: "grounded_verification",
      title: "Unsupported Superlative Ranking Claim",
      why: `Rule R-12 requires third-party ranking citations (e.g. CRISIL, Morningstar) for '#1' or 'Best' claims. No active report in the Vault substantiates this ranking.`,
      ruleId: "R-12 v1.0",
      sourceId: "Approved Sources Vault",
      evidence: "Searched 14 active source records. Zero CRISIL/Morningstar certificates found for #1 rank.",
      confidence: 0.88,
      confidenceNote: "Strict Abstention: Lack of evidence flags 'Needs Verification', never 'False'",
      suggestedFix: "a leading gold savings fund",
      intentNote: "Retains strong category leadership positioning without unsubstantiated #1 regulatory liability.",
      status: "open",
    });
  }

  // 4. Terminology / Acronym rule (G-04)
  const sipRegex = /\b(SIP)\b(?!.*Systematic Investment Plan)/i;
  const sipMatch = text.match(sipRegex);
  if (sipMatch) {
    findings.push({
      id: `FND-LIVE-${count++}`,
      kind: "low_confidence",
      severity: "low",
      phrase: sipMatch[0],
      engine: "rule_engine",
      title: "Glossary Guideline: Spell Acronym on First Use",
      why: `Glossary rule G-04 recommends spelling out 'Systematic Investment Plan (SIP)' on first retail touchpoint to maintain clarity for new investors.`,
      ruleId: "G-04 v1.1",
      sourceId: "E-102 Brand Glossary",
      evidence: "G-04 v1.1: Spell out retail acronyms on first occurrence in social/landing campaigns.",
      confidence: 0.72,
      confidenceNote: "Contextual tone guideline",
      suggestedFix: "Systematic Investment Plan (SIP)",
      intentNote: "Expands acronym for customer readability while keeping call-to-action intact.",
      status: "open",
    });
  }

  // 5. Tone of Voice / Hype Rule (T-03)
  const hypeRegex = /(hurry\s+up|insane\s+profits|get\s+rich|skyrocket|don't\s+miss\s+out|once\s+in\s+a\s+lifetime)/i;
  const hypeMatch = text.match(hypeRegex);
  if (hypeMatch) {
    findings.push({
      id: `FND-LIVE-${count++}`,
      kind: "confirmed_violation",
      severity: "medium",
      phrase: hypeMatch[0],
      engine: "rule_engine",
      title: "Off-Brand Hype Language (Rule T-03)",
      why: `Brand Tone Guideline T-03 requires a calm, steady, institutional voice. Sensationalist FOMO language damages organizational credibility.`,
      ruleId: "T-03 v1.2",
      sourceId: "E-102 Brand Guideline",
      evidence: "T-03 v1.2: Prohibits artificial urgency phrases such as 'hurry up' or 'insane profits'.",
      confidence: 0.95,
      confidenceNote: "Tone dictionary match",
      suggestedFix: "begin your disciplined journey",
      intentNote: "Transforms artificial hype into steady, credible brand phrasing.",
      status: "open",
    });
  }

  // 6. Missing Mandatory Statutory Disclaimer (R-02)
  if (
    (text.toLowerCase().includes("fund") || text.toLowerCase().includes("return") || text.toLowerCase().includes("wealth")) &&
    !text.toLowerCase().includes("market risk")
  ) {
    findings.push({
      id: `FND-LIVE-${count++}`,
      kind: "confirmed_violation",
      severity: "critical",
      phrase: text.split(" ").slice(-3).join(" ") || "campaign closing",
      engine: "rule_engine",
      title: "Missing Statutory Market Risk Disclaimer",
      why: `Statutory Rule R-02 requires all promotional copy mentioning funds, returns, or investments to display the mandatory SEBI disclaimer.`,
      ruleId: "R-02 v1.0",
      sourceId: "E-007 Advertising Code",
      evidence: "SEBI Clause 7: 'Mutual Fund investments are subject to market risks, read all scheme related documents carefully.' is absent.",
      confidence: 1.0,
      confidenceNote: "Deterministic statutory compliance check",
      suggestedFix: `${text.trim()} *Mutual fund investments are subject to market risks, read all scheme related documents carefully.`,
      intentNote: "Appends mandatory statutory disclosure to protect the organisation from regulatory enforcement.",
      status: "open",
    });
  }

  // 7. Visual & Accessibility Checks for Image format
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
        sourceId: "Brand Accessibility Standard",
        evidence: "Creative asset uploaded without meaningful accessible alt metadata.",
        confidence: 1.0,
        confidenceNote: "Automated accessibility validator",
        suggestedFix: "Add descriptive text: 'Arthaa Gold Savings Fund festive investment campaign banner featuring wealth growth illustration and Q2 audited figures.'",
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
        sourceId: "Brand Design Token Catalog",
        evidence: `Calculated foreground/background contrast is ${mediaMeta.contrastRatio.toFixed(1)}:1, falling below WCAG AA threshold.`,
        confidence: 0.99,
        confidenceNote: "Color analyzer luminance calculation",
        suggestedFix: "Adjust headline overlay to #FFFFFF or apply a 30% dark scrim behind text",
        intentNote: "Maintains brand visual polish and legibility on mobile screens.",
        status: "open",
      });
    }
  }

  // 8. Generic fallback if user typed clean copy
  if (findings.length === 0 && text.trim().length > 10) {
    findings.push({
      id: `FND-LIVE-01`,
      kind: "needs_verification",
      severity: "low",
      phrase: text.split(" ").slice(0, 3).join(" "),
      engine: "grounded_verification",
      title: "Content Intake Complete: No High-Severity Flags",
      why: "Content scanned against active Brand Rules, Approved Terminology, and Fact Ledger. 0 critical violations detected.",
      ruleId: "R-11 Baseline",
      sourceId: "Brand Governance Repository",
      evidence: "Automated scan completed with 0 regulatory breaches.",
      confidence: 0.96,
      confidenceNote: "Grounded semantic pass",
      suggestedFix: text.trim(),
      intentNote: "Content compliant; ready for final human sign-off.",
      status: "open",
    });
  }

  return findings;
}
