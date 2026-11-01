"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { DURATION, EASE_REVEAL, VIEWPORT } from "@/lib/motion";

type ImageRevealProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  /** Parallax travel in % of the frame height. 0 disables. */
  parallax?: number;
  children?: React.ReactNode;
};

/**
 * Clipped image with the reference's reveal: the picture rises from 30%
 * and settles from scale 1.2 → 1 inside an overflow-hidden frame, then
 * drifts with a gentle scroll-linked parallax.
 */
export function ImageReveal({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  imageClassName,
  priority,
  parallax = 6,
  children,
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${parallax}%`, `${parallax}%`]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div className="absolute inset-[-8%]" style={parallax ? { y } : undefined}>
        <motion.div
          className="h-full w-full"
          initial={{ opacity: 0, y: "30%", scale: 1.2 }}
          whileInView={{ opacity: 1, y: "0%", scale: 1 }}
          viewport={VIEWPORT}
          transition={{ duration: DURATION.image, ease: EASE_REVEAL }}
        >
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            priority={priority}
            loading={priority ? undefined : "lazy"}
            className={`h-full w-full object-cover ${imageClassName ?? ""}`}
          />
        </motion.div>
      </motion.div>
      {children}
    </div>
  );
}
