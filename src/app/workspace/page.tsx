import { ReviewWorkspace } from "@/components/sections/ReviewWorkspace";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Workspace — VerityBrand",
  description: "Role-based AI brand governance review workspace for marketing copy, visual creatives, and financial disclosures.",
};

export default function WorkspacePage() {
  return <ReviewWorkspace />;
}
