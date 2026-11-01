"use client";

import { MotionConfig } from "motion/react";

/**
 * Global motion configuration. `reducedMotion="user"` makes Motion skip
 * transform/layout animation when the OS requests reduced motion, leaving
 * only opacity fades. CSS transitions are collapsed in globals.css.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
