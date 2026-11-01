"use client";

import React from "react";
import Image from "next/image";
import { RevealText } from "@/components/motion/RevealText";
import { Reveal } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { RollText } from "@/components/ui/Button";
import { SITE_DATA } from "@/data/siteData";

export function About() {
  const { about } = SITE_DATA;

  return (
    <section id="about" className="section-y bg-[#eee9dc] text-[#1c1a18]">
      <div className="container-x">
        {/* Section Title (Introduction) Headline */}
        <div className="max-w-4xl mb-16 sm:mb-24">
          <RevealText
            label={about.sectionLabel}
            text={about.headline}
            as="h2"
            className="t-h2 font-medium tracking-tight leading-[1.12]"
          />
        </div>

        {/* Two-Column Editorial Image & Text Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Asymmetrical Editorial Photography */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] shadow-md">
              <ImageReveal
                src="/images/intro-hands.jpg"
                alt="Hands annotating marketing draft against evidence"
                width={896}
                height={1200}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="h-full w-full"
                parallax={5}
              />
            </div>
            <p className="text-xs uppercase tracking-wider text-[#6b685e] font-mono">
              Fig. 01 — Tactile review protocol · Intent-preserving intervention
            </p>
          </div>

          {/* Right Column: Studio Image + Editorial Copy + CTA */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] shadow-md mb-10">
              <ImageReveal
                src="/images/intro-studio.jpg"
                alt="VerityBrand calm review studio workspace"
                width={1376}
                height={768}
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="h-full w-full"
                parallax={4}
              />
            </div>

            {/* Editorial body paragraphs */}
            <div className="space-y-6 text-[#1c1a18]/85 text-base sm:text-lg leading-relaxed mb-10">
              {about.paragraphs.map((para, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <p>{para}</p>
                </Reveal>
              ))}
            </div>

            {/* Circular CTA Button matching Alma's 'About Me' */}
            <Reveal delay={0.3}>
              <div>
                <a
                  href={about.cta.href}
                  className="group/btn relative inline-flex items-center gap-2 rounded-pill border border-[#1c1a18]/40 text-[#1c1a18] px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] transition-all duration-300 hover:bg-[#1c1a18] hover:text-[#eee8db] active:scale-95"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c26043] transition-transform duration-300 group-hover/btn:scale-150" />
                  <RollText>{about.cta.label}</RollText>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
