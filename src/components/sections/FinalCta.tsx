"use client";

import React from "react";
import Image from "next/image";
import { RollText } from "@/components/ui/Button";
import { SITE_DATA } from "@/data/siteData";

interface FinalCtaProps {
  onOpenWorkspace?: () => void;
}

export function FinalCta({ onOpenWorkspace }: FinalCtaProps) {
  const { finalCta } = SITE_DATA;

  return (
    <section className="relative w-full bg-[#0e231a] text-on-dark py-24 sm:py-32 overflow-hidden">
      {/* Background Photography with blurred prism light leak */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/cta-light.jpg"
          alt="VerityBrand atmospheric light band"
          fill
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e231a]/90 via-[#0e231a]/70 to-[#0e231a]/95" />
      </div>

      <div className="container-x relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center">
        <span className="text-xs font-mono uppercase tracking-[0.1em] text-brand-pink-soft mb-4 block">
          {finalCta.eyebrow}
        </span>

        <h2 className="t-display tracking-tight text-on-dark mb-6 text-balance">
          {finalCta.heading}
        </h2>

        <p className="text-base sm:text-xl text-[#eee8db]/85 leading-relaxed mb-10 max-w-xl text-pretty">
          {finalCta.supportingText}
        </p>

        {onOpenWorkspace ? (
          <button
            onClick={onOpenWorkspace}
            className="group/btn relative inline-flex items-center gap-2.5 rounded-pill bg-[#eee8db] text-[#15271e] min-h-14 px-9 py-4 text-sm font-semibold uppercase tracking-[0.08em] shadow-2xl transition-all duration-300 hover:bg-white active:scale-95"
          >
            <span className="h-2 w-2 rounded-full bg-brand-pink transition-transform duration-300 group-hover/btn:scale-150" />
            <RollText>{finalCta.primaryCta.label}</RollText>
          </button>
        ) : (
          <a
            href="#workspace"
            className="group/btn relative inline-flex items-center gap-2.5 rounded-pill bg-[#eee8db] text-[#15271e] min-h-14 px-9 py-4 text-sm font-semibold uppercase tracking-[0.08em] shadow-2xl transition-all duration-300 hover:bg-white active:scale-95"
          >
            <span className="h-2 w-2 rounded-full bg-brand-pink transition-transform duration-300 group-hover/btn:scale-150" />
            <RollText>{finalCta.primaryCta.label}</RollText>
          </a>
        )}
      </div>
    </section>
  );
}
