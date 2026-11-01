"use client";

import React from "react";
import Image from "next/image";
import { RevealText } from "@/components/motion/RevealText";
import { Reveal } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { SITE_DATA } from "@/data/siteData";

export function Introduction() {
  const { introduction } = SITE_DATA;

  return (
    <section id="overview" className="section-y bg-background text-text-primary">
      <div className="container-x">
        {/* Large Statement Heading echoing Alma's intro layout */}
        <div className="max-w-4xl mb-16 sm:mb-24">
          <RevealText
            label={introduction.sectionLabel}
            text={introduction.leadStatement}
            as="h2"
            className="t-h2 font-medium tracking-tight leading-[1.15]"
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
            <p className="text-xs uppercase tracking-wider text-text-muted font-mono">
              Fig. 01 — Tactile review protocol · Intent-preserving intervention
            </p>
          </div>

          {/* Right Column: Studio Image + Editorial Copy + Stats */}
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
            <div className="space-y-6 text-text-secondary text-base sm:text-lg leading-relaxed mb-12">
              {introduction.bodyParagraphs.map((para, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <p>{para}</p>
                </Reveal>
              ))}
            </div>

            {/* Key Invariant Stats */}
            <Reveal delay={0.3}>
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
                {introduction.stats.map((stat, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="font-serif italic text-3xl sm:text-4xl text-brand-green font-normal">
                      {stat.value}
                    </span>
                    <span className="text-xs sm:text-sm text-text-muted font-sans mt-1">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
