"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { RollText } from "@/components/ui/Button";
import { SITE_DATA } from "@/data/siteData";

interface HeroProps {
  onOpenWorkspace?: () => void;
}

export function Hero({ onOpenWorkspace }: HeroProps) {
  const { hero } = SITE_DATA;

  return (
    <section className="relative min-h-[92vh] sm:min-h-screen w-full bg-[#1c1a18] text-on-dark flex flex-col justify-end overflow-hidden pb-16 sm:pb-24 pt-32">
      {/* Background Photography with prism light leak */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero.jpg"
          alt="VerityBrand collaborative marketing and compliance governance review"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[68%_35%] sm:object-[60%_30%] opacity-90"
        />
        {/* Editorial gradient overlays reproducing Alma's deep atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141008] via-[#141008]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141008]/80 via-[#141008]/30 to-transparent sm:w-2/3" />

        {/* Delicate geometric lens curves inspired by Alma */}
        <svg
          className="lens-lines opacity-30"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="280" cy="450" r="520" stroke="#eee8db" strokeWidth="1" />
          <circle cx="1200" cy="300" r="420" stroke="#eee8db" strokeWidth="0.75" />
        </svg>
      </div>

      {/* Main Hero Foreground */}
      <div className="container-x relative z-10 w-full">
        <div className="max-w-4xl">
          {/* Fluid H1 Heading exactly formatted to Alma's 72px line-height and tracking */}
          <h1 className="t-display tracking-[-0.04em] text-on-dark mb-8 text-balance">
            <span className="block font-sans font-medium">{hero.titleLine1}</span>
            <span className="block font-sans font-medium text-[#eee8db]/90">
              {hero.titleLine2}
            </span>
          </h1>

          <div className="flex flex-wrap items-center gap-4 sm:gap-5">
            <button
              onClick={onOpenWorkspace}
              className="group/btn relative inline-flex items-center gap-2.5 rounded-pill bg-[#eee8db] text-[#1c1a18] min-h-12 px-7 py-3.5 t-eyebrow font-semibold uppercase tracking-[0.08em] shadow-lg transition-all duration-300 hover:bg-white active:scale-95"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#c26043] transition-transform duration-300 group-hover/btn:scale-150" />
              <RollText>{hero.primaryCta.label}</RollText>
            </button>

            <a
              href={hero.secondaryCta.href}
              className="group/btn relative inline-flex items-center gap-2 rounded-pill border border-on-dark/40 text-on-dark min-h-12 px-6 py-3.5 t-eyebrow font-semibold uppercase tracking-[0.08em] transition-all duration-300 hover:bg-on-dark hover:text-[#1c1a18] active:scale-95"
            >
              <RollText>{hero.secondaryCta.label}</RollText>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
