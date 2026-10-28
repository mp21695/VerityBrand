"use client";

import React, { useState } from "react";
import LandingView from "@/components/LandingView";
import WorkspaceView from "@/components/WorkspaceView";
import DocsModal from "@/components/DocsModal";

export default function HomePage() {
  const [activeView, setActiveView] = useState<"landing" | "workspace">("landing");
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#192839] text-[#FFFFFF] relative">
      {/* Restrained 1px-bordered mode switcher in bottom-left */}
      <div className="fixed bottom-4 left-4 z-40 hidden sm:flex items-center rounded border border-[#B4CDFD]/25 bg-[#192839]/90 p-0.5 backdrop-blur-xl font-mono text-[11px]">
        <button
          onClick={() => setActiveView("landing")}
          className={`rounded-sm px-3 py-1 transition-all ${
            activeView === "landing"
              ? "bg-[#3395FF] text-[#FFFFFF] font-semibold"
              : "text-[#B4CDFD] hover:text-[#FFFFFF]"
          }`}
        >
          01 / Overview
        </button>
        <button
          onClick={() => setActiveView("workspace")}
          className={`rounded-sm px-3 py-1 transition-all ${
            activeView === "workspace"
              ? "bg-[#3395FF] text-[#FFFFFF] font-semibold"
              : "text-[#B4CDFD] hover:text-[#FFFFFF]"
          }`}
        >
          02 / Workspace →
        </button>
      </div>

      {activeView === "landing" ? (
        <LandingView
          onLaunchWorkspace={() => {
            setActiveView("workspace");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onOpenDocs={() => setIsDocsOpen(true)}
        />
      ) : (
        <WorkspaceView
          onBackToLanding={() => {
            setActiveView("landing");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onOpenDocs={() => setIsDocsOpen(true)}
        />
      )}

      <DocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
        onLaunchWorkspace={() => {
          setActiveView("workspace");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
