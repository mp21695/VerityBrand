import { DEMO_DRAFT, DEMO_FINDINGS, seedAudit } from "./seed";
import type { ReviewState } from "./reducer";

export * from "./types";
export * from "./hash";
export * from "./meta";
export * from "./seed";
export * from "./reducer";
export * from "./analyzer";

export function createInitialReviewState(): ReviewState {
  return {
    draft: DEMO_DRAFT,
    phase: "in_review",
    findings: DEMO_FINDINGS,
    audit: seedAudit(),
    role: "approver",
    selectedId: DEMO_FINDINGS[0].id,
  };
}
