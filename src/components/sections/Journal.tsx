"use client";

import React from "react";
import Image from "next/image";
import { RevealText } from "@/components/motion/RevealText";
import { Reveal } from "@/components/motion/Reveal";
import { RollText } from "@/components/ui/Button";
import { SITE_DATA } from "@/data/siteData";

export function Journal() {
  const { journal } = SITE_DATA;

  return (
    <section id="journal" className="py-24 sm:py-36 bg-[#eee9dc] text-[#1c1a18]">
      <div className="container-x">
        {/* Section Title (My Journal) */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <RevealText
            label={journal.sectionLabel}
            text={journal.headline}
            as="h2"
            className="t-h2 font-medium tracking-tight leading-[1.12]"
          />
        </div>

        {/* 3 Articles Grid matching Alma's precise editorial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 mb-16">
          {journal.articles.map((item, idx) => (
            <Reveal key={item.id} delay={idx * 0.1}>
              <div className="group bg-[#f7f1e7] rounded-none p-6 border border-[#1c1a18]/10 flex flex-col justify-between h-full hover:shadow-lg transition-all duration-300">
                <div>
                  {/* Article Thumbnail */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden mb-6 bg-[#eee9dc]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 text-xs font-mono text-[#6b685e] uppercase tracking-wider mb-3">
                    <span>{item.date}</span>
                    <span>·</span>
                    <span>{item.readTime}</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-[#1c1a18] leading-snug mb-3">
                    {item.title}
                  </h3>

                  <p className="text-sm text-[#1c1a18]/75 leading-relaxed font-sans mb-6">
                    {item.summary}
                  </p>
                </div>

                {/* Read Link with dot */}
                <div className="pt-4 border-t border-[#1c1a18]/10 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1c1a18] group-hover:text-[#c26043] transition-colors">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c26043]" />
                  <span>Read the article</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* View More Button (Alma bottom right) */}
        <div className="flex justify-end">
          <a
            href={journal.cta.href}
            className="group/btn relative inline-flex items-center gap-2 rounded-pill border border-[#1c1a18]/40 text-[#1c1a18] px-7 py-3 text-xs font-semibold uppercase tracking-[0.08em] hover:bg-[#1c1a18] hover:text-[#eee8db] transition-all"
          >
            <RollText>{journal.cta.label}</RollText>
          </a>
        </div>
      </div>
    </section>
  );
}
