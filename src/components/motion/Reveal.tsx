"use client";

import { motion } from "motion/react";
import { fadeUp, VIEWPORT } from "@/lib/motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "p" | "article" | "span";
};

/** Section/block entrance: fade + rise + de-blur when scrolled into view. */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      custom={delay}
    >
      {children}
    </Comp>
  );
}
