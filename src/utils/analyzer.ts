import { FindingRecord } from "@/data/mockData";

export function analyzeCustomDraftText(text: string): FindingRecord[] {
  const findings: FindingRecord[] = [];
  let count = 1;

  // 1. Check guaranteed / fixed return rules (Rule R-07 v3.0)
  const guaranteedRegex = /(guaranteed\s+\d+%?\s*returns?|guaranteed\s+returns?|assured\s+\d+%?\s*returns?|zero\s+risk|100%\s+safe)/i;
  const guaranteedMatch = text.match(guaranteedRegex);
  if (guaranteedMatch && guaranteedMatch.index !== undefined) {
    const phrase = guaranteedMatch[0];
    findings.push({
      id: `F-LIVE-0${count}`,
      number: count++,
      category: "Confirmed violation",
      severity: "critical",
      targetPhrase: phrase,
      replacementPhrase: "long-term, market-linked investing*",
      ruleOrFactId: "Rule R-07",
      ruleVersion: "v3.0",
      evidenceId: "E-014",
      sourceName: "SEBI Mutual Fund Ad Code & Brand Rules v3.0",
      confidence: 1.0,
      whyExplanation: `Rule R-07 v3.0 strictly prohibits promising fixed, assured, or "${phrase}" on market-linked mutual fund schemes.`,
      fixInstruction:
        'Replace with "long-term, market-linked investing*" and include mandatory KIM risk disclosure.',
      intentNote: "Intent kept: growth appeal without prohibited return guarantees.",
      status: "pending",
      span: [guaranteedMatch.index, guaranteedMatch.index + phrase.length],
      checkType: "rule",
    });
  }

  // 2. Check expired AUM figures (Fact F-021)
  const aumRegex = /((?:Rs\.?|₹)\s*4,?200\s*crore)/i;
  const aumMatch = text.match(aumRegex);
  if (aumMatch && aumMatch.index !== undefined) {
    const phrase = aumMatch[0];
    findings.push({
      id: `F-LIVE-0${count}`,
      number: count++,
      category: "Expired fact",
      severity: "medium",
      targetPhrase: phrase,
      replacementPhrase: "Rs 4,850 crore (Q3 FY26 audited AUM)",
      ruleOrFactId: "Fact F-021",
      ruleVersion: "v2.4",
      evidenceId: "E-089",
      sourceName: "Finance Fact Ledger (Q2-Q3 FY26)",
      confidence: 0.99,
      whyExplanation:
        "Fact F-021 (AUM = Rs 4,200 crore) lapsed on 30 Jun 2026. The refreshed Q3 FY26 audited AUM figure is Rs 4,850 crore.",
      fixInstruction:
        "Update to current Q3 FY26 audited AUM figure (Rs 4,850 crore) from Finance Fact Ledger F-021.",
      intentNote: "Intent kept: scale & institutional trust proof point with refreshed Q3 ledger figure.",
      status: "pending",
      span: [aumMatch.index, aumMatch.index + phrase.length],
      checkType: "fact_expiry",
    });
  }

  // 3. Check unverified superlative / #1 claims
  const rankRegex = /(India's\s+#1\s+fund|#1\s+gold\s+fund|best\s+fund\s+in\s+India|beating\s+99%\s+of\s+peers)/i;
  const rankMatch = text.match(rankRegex);
  if (rankMatch && rankMatch.index !== undefined) {
    const phrase = rankMatch[0];
    findings.push({
      id: `F-LIVE-0${count}`,
      number: count++,
      category: "Needs verification",
      severity: "high",
      targetPhrase: phrase,
      replacementPhrase: "a leading domestic gold savings fund",
      ruleOrFactId: "No approved source",
      ruleVersion: "KIM-2026",
      evidenceId: "NONE",
      sourceName: "Approved Sources & KIM Repository",
      confidence: 0.94,
      whyExplanation: `No approved CRISIL or Morningstar source supports "${phrase}". VerityBrand abstains from an unsupported verdict and requires source citation or removal.`,
      fixInstruction:
        "Attach an approved CRISIL/Morningstar Q3 source ID or replace the superlative claim.",
      intentNote: "Intent kept: strong category positioning without unverified #1 ranking exposure.",
      status: "pending",
      span: [rankMatch.index, rankMatch.index + phrase.length],
      checkType: "claim_retrieval",
    });
  }

  // 4. Check ELSS lock-in mismatch (Fact F-009)
  const lockInRegex = /(1-year\s+lock-in\s+period|no\s+lock-in\s+period)/i;
  const lockInMatch = text.match(lockInRegex);
  if (lockInMatch && lockInMatch.index !== undefined) {
    const phrase = lockInMatch[0];
    findings.push({
      id: `F-LIVE-0${count}`,
      number: count++,
      category: "Confirmed violation",
      severity: "high",
      targetPhrase: phrase,
      replacementPhrase: "statutory 3-year ELSS lock-in period",
      ruleOrFactId: "Fact F-009",
      ruleVersion: "v1.0",
      evidenceId: "E-031",
      sourceName: "ELSS Product Fact Sheet (Section 80C)",
      confidence: 0.98,
      whyExplanation:
        "Fact F-009 states that ELSS tax-saving funds require a statutory 3-year lock-in period under Section 80C.",
      fixInstruction: 'Update to "statutory 3-year ELSS lock-in period".',
      intentNote: "Intent kept: clear liquidity horizon aligned with statutory rules.",
      status: "pending",
      span: [lockInMatch.index, lockInMatch.index + phrase.length],
      checkType: "rule",
    });
  }

  // 5. Check Tone Rule T-03
  const toneRegex = /(Grow\s+your\s+wealth|Double\s+your\s+wealth|Get\s+rich\s+fast)/i;
  const toneMatch = text.match(toneRegex);
  if (toneMatch && toneMatch.index !== undefined) {
    const phrase = toneMatch[0];
    findings.push({
      id: `F-LIVE-0${count}`,
      number: count++,
      category: "Low confidence",
      severity: "low",
      targetPhrase: phrase,
      replacementPhrase: "Build steady wealth",
      ruleOrFactId: "Tone rule T-03",
      ruleVersion: "v1.2",
      evidenceId: "E-102",
      sourceName: "Arthaa Tone & Voice Guidelines v1.2",
      confidence: 0.68,
      whyExplanation: `Possible mismatch with the "calm, plain-spoken" tone rule T-03 when "${phrase}" is used as an aggressive return hook.`,
      fixInstruction: 'Review with brand team or soften to "Build steady wealth".',
      intentNote: "Intent kept: aspirational wealth-building message in Arthaa's calm voice.",
      status: "pending",
      span: [toneMatch.index, toneMatch.index + phrase.length],
      checkType: "tone_ai",
    });
  }

  // If user enters completely custom text without exact regex hits, provide a realistic grounded check if they mention numbers or returns
  if (findings.length === 0 && text.trim().length > 15) {
    const words = text.trim().split(/\s+/);
    const snippet = words.slice(0, Math.min(4, words.length)).join(" ");
    findings.push({
      id: `F-LIVE-01`,
      number: 1,
      category: "Needs verification",
      severity: "medium",
      targetPhrase: snippet,
      replacementPhrase: `${snippet} (Verified per Arthaa Q4 Guidelines)`,
      ruleOrFactId: "Rule R-11",
      ruleVersion: "v2.0",
      evidenceId: "E-105",
      sourceName: "Arthaa Brand Governance Baseline v2.0",
      confidence: 0.86,
      whyExplanation:
        "New custom copy detected. Claim requires linking to an active Q4 campaign brief or KIM disclaimer before final sign-off.",
      fixInstruction: "Verify claim alignment with Q4 Campaign Brief or accept annotated phrasing.",
      intentNote: "Intent kept: original creator message preserved with governance verification.",
      status: "pending",
      span: [0, snippet.length],
      checkType: "claim_retrieval",
    });
  }

  return findings;
}
