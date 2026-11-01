"use client";

import React, { useState } from "react";
import { RevealText } from "@/components/motion/RevealText";
import { SITE_DATA } from "@/data/siteData";

export function FAQ() {
  const { faq } = SITE_DATA;
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-24 sm:py-36 bg-[#eee9dc] text-[#1c1a18] border-t border-[#1c1a18]/10">
      <div className="container-x">
        {/* Section Title (FAQs) */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <RevealText
            label={faq.sectionLabel}
            text={faq.headline}
            as="h2"
            className="t-h2 font-medium tracking-tight leading-[1.12]"
          />
        </div>

        {/* Minimal Accordion List matching Alma's hairline design */}
        <div className="divide-y divide-[#1c1a18]/15 border-y border-[#1c1a18]/15">
          {faq.questions.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="py-6 sm:py-8 transition-colors">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full flex items-start justify-between text-left gap-6 group focus:outline-none"
                >
                  <span className="font-serif text-xl sm:text-2xl text-[#1c1a18] group-hover:text-[#c26043] transition-colors">
                    {item.q}
                  </span>
                  <span className="text-2xl text-[#1c1a18]/60 font-light shrink-0 ml-4">
                    {isOpen ? "—" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-4 pt-2 max-w-3xl">
                    <p className="text-base sm:text-lg text-[#1c1a18]/75 leading-relaxed font-sans">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
