"use client";

import { motion, useInView, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  once?: boolean;
  blur?: boolean;
  scale?: boolean;
}

const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  direction = "up",
  distance = 40,
  once = true,
  blur = false,
  scale = false,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-50px" });

  const getDirectionOffset = () => {
    switch (direction) {
      case "up":
        return { y: distance };
      case "down":
        return { y: -distance };
      case "left":
        return { x: distance };
      case "right":
        return { x: -distance };
      default:
        return {};
    }
  };

  const variants: Variants = {
    hidden: {
      opacity: 0,
      ...getDirectionOffset(),
      ...(blur && { filter: "blur(10px)" }),
      ...(scale && { scale: 0.95 }),
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
      transition: {
        duration,
        delay,
        ease: [0.25, 0.4, 0.25, 1], // Custom cubic bezier for premium feel
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Staggered container for child animations
interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayStart?: number;
}

export const StaggerContainer = ({
  children,
  className = "",
  staggerDelay = 0.1,
  delayStart = 0,
}: StaggerContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayStart,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Individual stagger item
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}

export const StaggerItem = ({
  children,
  className = "",
  direction = "up",
}: StaggerItemProps) => {
  const getOffset = () => {
    switch (direction) {
      case "up":
        return { y: 30 };
      case "down":
        return { y: -30 };
      case "left":
        return { x: 30 };
      case "right":
        return { x: -30 };
    }
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      ...getOffset(),
      filter: "blur(8px)",
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1],
      },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
