"use client";

import React, { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { RevealText } from "@/components/motion/RevealText";
import { SITE_DATA } from "@/data/siteData";

export function Process() {
  const { process } = SITE_DATA;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Monitor scroll progression through the section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // 4 steps -> determine active step based on progress
    const total = process.steps.length;
    const stepIdx = Math.min(total - 1, Math.max(0, Math.floor(latest * total)));
    setActiveStep(stepIdx);
  });

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative bg-[#eee9dc] text-[#1c1a18]"
    >
      <div className="container-x pt-24 sm:pt-36">
        {/* Section Title (My Process) Headline */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <RevealText
            label={process.sectionLabel}
            text={process.headline}
            as="h2"
            className="t-h2 font-medium tracking-tight leading-[1.12]"
          />
        </div>
      </div>

      {/* 2-Column Layout: Left Sticky 206px Counter, Right Scrollable Steps */}
      <div className="container-x">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start pb-32 sm:pb-48">
          {/* Left Column: Sticky 206px Counter Digits synced with scroll */}
          <div className="lg:col-span-5 sticky top-32 sm:top-40 h-fit pb-12">
            <div className="flex items-baseline select-none overflow-hidden h-[130px] sm:h-[180px] lg:h-[230px]">
              <span className="font-serif text-8xl sm:text-9xl lg:text-[12.875rem] font-light leading-none text-[#1c1a18]">
                0
              </span>
              <div className="relative inline-block overflow-hidden h-full">
                <motion.div
                  animate={{ y: `-${activeStep * 25}%` }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col font-serif text-8xl sm:text-9xl lg:text-[12.875rem] font-light leading-none text-[#1c1a18]"
                >
                  {process.steps.map((_, i) => (
                    <span key={i} className="block leading-none">
                      {i + 1}
                    </span>
                  ))}
                </motion.div>
              </div>
            </div>
            <p className="text-xs uppercase font-mono tracking-widest text-[#6b685e] mt-4">
              Lifecycle Stage · 0{activeStep + 1} of 0{process.steps.length}
            </p>
          </div>

          {/* Right Column: Step cards that provide plenty of scroll height */}
          <div className="lg:col-span-7 space-y-36 sm:space-y-56 pt-6">
            {process.steps.map((step, idx) => (
              <div
                key={step.number}
                className="scroll-mt-48 transition-all duration-300"
              >
                <div className="text-3xl sm:text-4xl text-[#1c1a18] mb-4 select-none">
                  ✱
                </div>
                <h3 className="font-serif italic text-4xl sm:text-5xl leading-[1.15] text-[#1c1a18] mb-6">
                  {step.title}
                </h3>
                <p className="text-lg sm:text-xl text-[#6b685e] leading-relaxed font-sans max-w-xl">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
