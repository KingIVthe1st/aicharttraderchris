"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface TextRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  shimmer?: boolean;
}

const TextReveal = ({
  children,
  className = "",
  delay = 0,
  shimmer = false,
}: TextRevealProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref} className={`inline-block overflow-hidden ${className}`}>
      <motion.span
        className={`inline-block ${shimmer ? "ai-text-shimmer" : ""}`}
        initial={{ y: "100%", opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
        transition={{
          duration: 0.6,
          delay,
          ease: [0.25, 0.4, 0.25, 1],
        }}
      >
        {children}
      </motion.span>
    </span>
  );
};

// Split text animation - each word animates separately
interface SplitTextProps {
  text: string;
  className?: string;
  wordClassName?: string;
  staggerDelay?: number;
  startDelay?: number;
}

export const SplitText = ({
  text,
  className = "",
  wordClassName = "",
  staggerDelay = 0.05,
  startDelay = 0,
}: SplitTextProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const words = text.split(" ");

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
          <motion.span
            className={`inline-block ${wordClassName}`}
            initial={{ y: "100%", rotateX: -90 }}
            animate={
              isInView ? { y: 0, rotateX: 0 } : { y: "100%", rotateX: -90 }
            }
            transition={{
              duration: 0.5,
              delay: startDelay + i * staggerDelay,
              ease: [0.25, 0.4, 0.25, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

export default TextReveal;
