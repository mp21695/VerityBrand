"use client";

import React from "react";
import Image from "next/image";
import { RevealText } from "@/components/motion/RevealText";
import { Reveal } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { SITE_DATA } from "@/data/siteData";

export function FutureEvolution() {
  const { futureEvolution } = SITE_DATA;

  return (
    <section id="future" className="section-y bg-background-soft text-text-primary">
      <div className="container-x">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs uppercase tracking-wider font-mono text-brand-pink mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-pink animate-pulse" />
            <span>{futureEvolution.badge}</span>
          </div>

          <RevealText
            label={futureEvolution.sectionLabel}
            text={futureEvolution.heading}
            as="h2"
            className="t-h2 font-medium tracking-tight mb-4"
          />
          <p className="text-lg text-text-muted">{futureEvolution.subheading}</p>
        </div>

        {/* The 3 Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {futureEvolution.pillars.map((pillar, idx) => (
            <Reveal key={pillar.tag} delay={idx * 0.12}>
              <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-border h-full flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted">
                      0{idx + 1} / {pillar.tag}
                    </span>
                    <span className="text-xs font-mono text-brand-green font-semibold">
                      Preview
                    </span>
                  </div>

                  <h3 className="font-serif italic text-2xl text-text-primary mb-3">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-6">
                    {pillar.description}
                  </p>

                  <div className="space-y-2 mb-6 pt-4 border-t border-border/60">
                    {pillar.deliverables.map((del, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-2 text-xs text-text-muted">
                        <span className="text-brand-green font-mono">→</span>
                        <span>{del}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative rounded-xl overflow-hidden aspect-[4/3] w-full shadow-inner mt-4">
                  <ImageReveal
                    src={pillar.image}
                    alt={pillar.title}
                    width={1200}
                    height={896}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="h-full w-full"
                    parallax={3}
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
