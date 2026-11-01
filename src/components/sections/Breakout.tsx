"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { SITE_DATA } from "@/data/siteData";

export function Breakout() {
  const { breakout } = SITE_DATA;
  const sectionRef = useRef<HTMLDivElement>(null);

  // Parallax on the background image
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[85vh] sm:h-[95vh] min-h-[600px] w-full overflow-hidden flex flex-col justify-between py-16 sm:py-24 text-white"
    >
      {/* Background Architectural Image with subtle parallax */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <motion.div
          style={{ y: imgY }}
          className="absolute inset-[-15%_0%] w-full h-[130%]"
        >
          <Image
            src={breakout.image}
            alt="VerityBrand calm architectural space overlooking mist forest"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center brightness-[0.92]"
          />
        </motion.div>
        {/* Soft dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Top / Mid Row: Three Italic Words styled to fit cleanly within container */}
      <div className="container-x relative z-10 w-full pt-10 sm:pt-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 items-center justify-between gap-4 sm:gap-6 text-center select-none">
          <span className="font-serif italic text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white drop-shadow-md">
            {breakout.word1}
          </span>
          <span className="font-serif italic text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white drop-shadow-md">
            {breakout.word2}
          </span>
          <span className="font-serif italic text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white drop-shadow-md">
            {breakout.word3}
          </span>
        </div>
      </div>

      {/* Bottom Description centered with proper padding */}
      <div className="container-x relative z-10 w-full text-center max-w-2xl mx-auto pb-4">
        <p className="text-sm sm:text-base text-white/90 leading-relaxed font-sans drop-shadow-sm">
          {breakout.description}
        </p>
      </div>
    </section>
  );
}
