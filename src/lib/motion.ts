/**
 * Shared motion tokens.
 *
 * One motion system for the whole product: Motion (motion/react) drives every
 * entrance, scroll-linked and state animation; CSS transitions for hover/focus
 * micro-interactions read the matching CSS custom properties in globals.css
 * (--ease-reveal, --duration-*). Keep the two in sync.
 *
 * The reveal curve [0.52, 0.02, 0.18, 1.01] and 0.8s duration are read
 * directly from the Alma reference's appear animations.
 */
import type { Transition, Variants } from "motion/react";

export const EASE_REVEAL = [0.52, 0.02, 0.18, 1.01] as const;
export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;

export const DURATION = {
  fast: 0.2,
  base: 0.4,
  slow: 0.8,
  image: 1.2,
} as const;

export const STAGGER = {
  words: 0.035,
  items: 0.08,
  cards: 0.12,
} as const;

export const SPRING_UI: Transition = { type: "spring", stiffness: 380, damping: 34, mass: 0.8 };
export const SPRING_SOFT: Transition = { type: "spring", stiffness: 160, damping: 26, mass: 1 };

export const revealTransition = (delay = 0): Transition => ({
  duration: DURATION.slow,
  ease: EASE_REVEAL,
  delay,
});

/** Fade + rise + de-blur, used for blocks of copy and cards. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32, filter: "blur(6px)" },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: revealTransition(delay),
  }),
};

/** Per-word text reveal (reference "blur in" text effect). */
export const wordReveal: Variants = {
  hidden: { opacity: 0, y: "0.4em", filter: "blur(8px)" },
  visible: { opacity: 1, y: "0em", filter: "blur(0px)", transition: { duration: DURATION.slow, ease: EASE_REVEAL } },
};

export const staggerContainer = (stagger: number = STAGGER.items, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Default in-view trigger: fire once, slightly before the element is centred. */
export const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;
