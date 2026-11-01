"use client";

import React, { useState } from "react";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Breakout } from "@/components/sections/Breakout";
import { Contact } from "@/components/sections/Contact";
import { Journal } from "@/components/sections/Journal";
import { FAQ } from "@/components/sections/FAQ";
import { ReviewWorkspace } from "@/components/sections/ReviewWorkspace";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  const [showWorkspaceModal, setShowWorkspaceModal] = useState<boolean>(false);

  const openWorkspace = () => {
    setShowWorkspaceModal(true);
  };

  return (
    <div className="relative min-h-screen bg-[#eee9dc] text-[#1c1a18] selection:bg-[#c26043]/20 selection:text-[#1c1a18]">
      {/* 1. Header with Promo Banner */}
      <Header onOpenWorkspace={openWorkspace} />

      <main>
        {/* 2. Hero Section */}
        <Hero onOpenWorkspace={openWorkspace} />

        {/* 3. About Section (Introduction) */}
        <About />

        {/* 4. Capabilities (Services: Sticky side-by-side with card peeling & spinning badge) */}
        <Services />

        {/* 5. Process Section (Sticky 206px Counter Digits synced with scroll) */}
        <Process />

        {/* 6. Breakout Section (Clean responsive 3 Words Banner with Parallax) */}
        <Breakout />

        {/* 7. Contact Section (Directly follows breakout, no previous stories) */}
        <Contact />

        {/* 8. Journal Section (Articles Cards) */}
        <Journal />

        {/* 9. FAQ Section (Hairline Accordion) */}
        <FAQ />
      </main>

      {/* 10. Footer with Massive Signature Watermark */}
      <Footer />

      {/* Dedicated Full Review Workspace Drawer / Modal when clicked */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md">
          <div className="relative min-h-screen bg-[#eee9dc]">
            <div className="sticky top-0 z-50 bg-[#1c1a18] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="font-serif italic text-2xl">VerityBrand</span>
                <span className="text-xs font-mono bg-white/10 px-2.5 py-0.5 rounded-full text-white/80">
                  Interactive Governance Workspace
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowWorkspaceModal(false)}
                className="px-4 py-2 rounded-full border border-white/20 text-xs font-mono uppercase tracking-wider hover:bg-white hover:text-black transition-all"
              >
                ✕ Close Workspace
              </button>
            </div>

            <ReviewWorkspace onBackToLanding={() => setShowWorkspaceModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
