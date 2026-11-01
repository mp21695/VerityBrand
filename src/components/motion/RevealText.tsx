"use client";

import { motion } from "motion/react";
import { STAGGER, VIEWPORT, staggerContainer, wordReveal } from "@/lib/motion";

type Tag = "h1" | "h2" | "h3" | "p";

type RevealTextProps = {
  text: string;
  as?: Tag;
  className?: string;
  /** Italic serif section label rendered inline before the heading, e.g. "(Process)". */
  label?: string;
  labelClassName?: string;
  /** "mount" for above-the-fold headings, "view" for scroll-triggered. */
  trigger?: "mount" | "view";
  delay?: number;
  id?: string;
};

/**
 * Word-by-word heading reveal (opacity + rise + blur), reproducing the
 * reference's text appear effect. The full string is exposed to assistive
 * tech via aria-label; the animated word spans are hidden from it.
 */
export function RevealText({
  text,
  as = "h2",
  className,
  label,
  labelClassName,
  trigger = "view",
  delay = 0,
  id,
}: RevealTextProps) {
  const Comp = motion[as];
  const words = text.split(" ");
  const animateProps =
    trigger === "mount"
      ? { initial: "hidden", animate: "visible" }
      : { initial: "hidden", whileInView: "visible", viewport: VIEWPORT };

  return (
    <Comp
      id={id}
      className={className}
      aria-label={label ? `${label} ${text}` : text}
      variants={staggerContainer(STAGGER.words, delay)}
      {...animateProps}
    >
      {label ? (
        <motion.span
          aria-hidden
          variants={wordReveal}
          className={`t-label mr-3 inline-block align-[0.2em] pl-[0.6em] sm:pl-[2.75rem] ${labelClassName ?? ""}`}
        >
          {label}
        </motion.span>
      ) : null}
      {words.map((word, i) => (
        <span key={`${word}-${i}`} aria-hidden className="inline-block whitespace-pre">
          <motion.span variants={wordReveal} className="inline-block will-change-transform">
            {word}
          </motion.span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Comp>
  );
}
