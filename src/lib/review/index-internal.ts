import { DEMO_DRAFT, DEMO_FINDINGS, seedAudit } from "./seed";
import { sha256 } from "./hash";
import type { ReviewState } from "./reducer";
import type { CampaignVersionSnapshot } from "./types";

export * from "./types";
export * from "./hash";
export * from "./meta";
export * from "./seed";
export * from "./reducer";
export * from "./analyzer";

export function createInitialReviewState(): ReviewState {
  const v1Snapshot: CampaignVersionSnapshot = {
    version: 1,
    label: "v1 — Original Draft",
    text: DEMO_DRAFT.text,
    creativeUri: "/images/NOVA_AeroRun_Campaign.png",
    creativeVersion: 1,
    author: DEMO_DRAFT.author,
    timestamp: DEMO_DRAFT.submittedAt,
    reason: "Initial multi-modal draft submission & OCR pass",
    findingsCount: DEMO_FINDINGS.length,
    openCount: DEMO_FINDINGS.filter((f) => f.status === "open").length,
    findings: DEMO_FINDINGS,
    contentHash: sha256(DEMO_DRAFT.text),
  };

  return {
    draft: DEMO_DRAFT,
    phase: "in_review",
    findings: DEMO_FINDINGS,
    audit: seedAudit(),
    role: "approver",
    selectedId: DEMO_FINDINGS[0].id,
    versionHistory: [v1Snapshot],
    currentVersionIndex: 0,
    creativeUri: "/images/NOVA_AeroRun_Campaign.png",
    creativeVersion: 1,
  };
}
