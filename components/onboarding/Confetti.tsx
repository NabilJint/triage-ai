"use client";

import { motion } from "motion/react";
import { confettiParticle } from "@/lib/variants";

const COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-error)",
];

const SHAPES = ["circle", "square"] as const;

export function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: 24 }).map((_, i) => {
        const color = COLORS[i % COLORS.length];
        const isCircle = SHAPES[i % SHAPES.length] === "circle";
        const size = 6 + (i % 4) * 2;

        return (
          <motion.div
            key={i}
            custom={i}
            variants={confettiParticle}
            initial="hidden"
            animate="visible"
            className="absolute"
            style={{
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: isCircle ? "50%" : "2px",
              left: "50%",
              top: "50%",
              marginLeft: -size / 2,
              marginTop: -size / 2,
            }}
          />
        );
      })}
    </div>
  );
}
