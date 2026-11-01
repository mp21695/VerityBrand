"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useMotionValueEvent, useTransform } from "motion/react";
import { RevealText } from "@/components/motion/RevealText";
import { SITE_DATA } from "@/data/siteData";

export function Services() {
  const { services } = SITE_DATA;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState<number>(0);

  // Measure scroll through the entire sticky section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Calculate slide-up transforms for layered card peel effect matching Alma
  // Image 1 slides up out of view as we scroll to step 2
  const img1Y = useTransform(scrollYProgress, [0, 0.45], ["0%", "-100%"]);
  // Image 2 slides up out of view as we scroll to step 3
  const img2Y = useTransform(scrollYProgress, [0.45, 0.85], ["0%", "-100%"]);

  // Spinning badge rotation linked to scroll
  const badgeRotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.38) {
      setActiveIdx(0);
    } else if (latest < 0.72) {
      setActiveIdx(1);
    } else {
      setActiveIdx(2);
    }
  });

  return (
    <section
      ref={sectionRef}
      id="capabilities"
      className="relative bg-[#ffffff] text-[#1c1a18]"
    >
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Column: Scrollable text content (Titles + Descriptions) */}
        <div className="w-full lg:w-1/2 px-6 sm:px-12 lg:px-20 pt-20 sm:pt-28 pb-32 sm:pb-52">
          {/* Section Title (Capabilities) */}
          <div className="max-w-md mb-20 sm:mb-28">
            <RevealText
              label={services.sectionLabel}
              text={services.headline}
              as="h2"
              className="t-h2 font-medium tracking-tight leading-[1.12]"
            />
          </div>

          {/* 3 Capability items with ample spacing to drive the scroll */}
          <div className="space-y-48 sm:space-y-64">
            {services.items.map((item, idx) => (
              <div
                key={item.id}
                className={`transition-opacity duration-300 ${
                  activeIdx === idx ? "opacity-100" : "opacity-40"
                }`}
              >
                <span className="text-xs font-mono uppercase tracking-widest text-[#6b685e] block mb-3">
                  Capability · 0{idx + 1}
                </span>
                <h3 className="font-serif italic text-4xl sm:text-5xl lg:text-6xl leading-[1.15] text-[#1c1a18] mb-6">
                  {item.title}
                </h3>
                <p className="text-lg sm:text-xl text-[#1c1a18]/75 leading-relaxed font-sans max-w-lg">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Full-height Sticky Imagery with animated peel transition */}
        <div className="hidden lg:block w-1/2 sticky top-0 h-screen overflow-hidden bg-[#1c1a18]">
          <div className="relative w-full h-full">
            {/* Layer 3: Service 3 Image (Base layer, bottom of stack) */}
            <div className="absolute inset-0 z-10">
              <Image
                src={services.items[2].image}
                alt={services.items[2].title}
                fill
                sizes="50vw"
                className="object-cover"
              />
            </div>

            {/* Layer 2: Service 2 Image (Slides up out of view on scroll) */}
            <motion.div
              style={{ y: img2Y }}
              className="absolute inset-0 z-20 will-change-transform"
            >
              <Image
                src={services.items[1].image}
                alt={services.items[1].title}
                fill
                sizes="50vw"
                className="object-cover"
              />
            </motion.div>

            {/* Layer 1: Service 1 Image (Slides up out of view first) */}
            <motion.div
              style={{ y: img1Y }}
              className="absolute inset-0 z-30 will-change-transform"
            >
              <Image
                src={services.items[0].image}
                alt={services.items[0].title}
                fill
                sizes="50vw"
                className="object-cover"
              />
            </motion.div>

            {/* Floating Spinning Shape icon matching Alma's brand emblem */}
            <motion.div
              style={{ rotate: badgeRotate }}
              className="absolute top-8 right-8 z-40 h-14 w-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white text-2xl"
            >
              ✱
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
