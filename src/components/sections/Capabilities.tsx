"use client";

import React from "react";
import { RevealText } from "@/components/motion/RevealText";
import { Reveal } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { SITE_DATA } from "@/data/siteData";

export function Capabilities() {
  const { capabilities } = SITE_DATA;

  return (
    <section id="capabilities" className="section-y bg-background-soft text-text-primary">
      <div className="container-x">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <RevealText
            label={capabilities.sectionLabel}
            text={capabilities.heading}
            as="h2"
            className="t-h2 font-medium tracking-tight mb-4"
          />
          <p className="text-lg text-text-muted">{capabilities.subheading}</p>
        </div>

        {/* Four Core Capabilities (Alma Services layout: alternating high-craft visual cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-20">
          {capabilities.core.map((item, idx) => (
            <Reveal key={item.id} delay={idx * 0.1}>
              <div className="group bg-surface rounded-2xl p-6 sm:p-8 border border-border flex flex-col justify-between h-full hover:shadow-lg transition-all duration-300">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-brand-pink bg-brand-pink-soft/40 px-2.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                    <span className="font-serif italic text-sm text-text-muted">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="font-serif italic text-2xl sm:text-3xl text-text-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="font-medium text-sm text-brand-green mb-4">
                    {item.tagline}
                  </p>
                  <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="relative rounded-xl overflow-hidden aspect-[4/3] w-full shadow-inner mt-4">
                  <ImageReveal
                    src={item.image}
                    alt={item.title}
                    width={896}
                    height={1200}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="h-full w-full"
                    parallax={3}
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Foundation Architecture Primitives: Brand Brain, Fact Ledger, Audit Trail, Insights */}
        <div className="pt-12 border-t border-border">
          <div className="mb-8">
            <span className="t-label text-brand-green mr-2">(Platform Architecture)</span>
            <h4 className="text-xl font-medium tracking-tight inline-block">
              Core Governance Infrastructure
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.foundation.map((item, idx) => (
              <Reveal key={idx} delay={0.2 + idx * 0.08}>
                <div className="bg-surface/80 rounded-xl p-6 border border-border hover:bg-surface transition-colors h-full flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono text-brand-green font-semibold uppercase tracking-wider block mb-2">
                      0{idx + 1} / {item.name}
                    </span>
                    <h5 className="font-medium text-base text-text-primary mb-2">
                      {item.subtitle}
                    </h5>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
