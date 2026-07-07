"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

type Point = { x: number; y: number };
type Segment = { x1: number; y1: number; x2: number; y2: number };
type AnimatedSeg = { target: Segment; rOff: number; rOff2: number };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function arc(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
  n: number,
): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = a0 + t * (a1 - a0);
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

function toSegments(pts: Point[]): Segment[] {
  const segs: Segment[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    segs.push({
      x1: pts[i].x,
      y1: pts[i].y,
      x2: pts[i + 1].x,
      y2: pts[i + 1].y,
    });
  }
  return segs;
}

function linspace(a: number, b: number, n: number): number[] {
  const pts: number[] = [];
  for (let i = 0; i < n; i++) {
    pts.push(lerp(a, b, i / Math.max(n - 1, 1)));
  }
  return pts;
}

function withOffsets(segs: Segment[]): AnimatedSeg[] {
  return segs.map((s) => ({
    target: s,
    rOff: (Math.random() - 0.5) * 50,
    rOff2: (Math.random() - 0.5) * 50,
  }));
}

function generateSegments() {
  const outline: Segment[] = [];
  const checkmark: Segment[] = [];

  const rx = 2.5;
  const xL = 1.5;
  const xR = 22.5;
  const yT = 4.5;
  const yB = 19.5;

  toSegments(linspace(xL + rx, xR - rx, 5).map((x) => ({ x, y: yT }))).forEach((s) => outline.push(s));
  toSegments(linspace(yT + rx, yB - rx, 5).map((y) => ({ x: xR, y }))).forEach((s) => outline.push(s));
  toSegments(linspace(xR - rx, xL + rx, 5).map((x) => ({ x, y: yB }))).forEach((s) => outline.push(s));
  toSegments(linspace(yB - rx, yT + rx, 5).map((y) => ({ x: xL, y }))).forEach((s) => outline.push(s));

  const cs = 4;
  const pushArc = (cx: number, cy: number, a0: number, a1: number) => {
    const pts = arc(cx, cy, rx, a0, a1, cs);
    for (let i = 1; i < pts.length; i++) {
      outline.push({ x1: pts[i - 1].x, y1: pts[i - 1].y, x2: pts[i].x, y2: pts[i].y });
    }
  };
  pushArc(xR - rx, yT + rx, -Math.PI / 2, 0);
  pushArc(xR - rx, yB - rx, 0, Math.PI / 2);
  pushArc(xL + rx, yB - rx, Math.PI / 2, Math.PI);
  pushArc(xL + rx, yT + rx, Math.PI, (3 * Math.PI) / 2);

  const flapPts: Point[] = [
    { x: xL, y: 6.5 },
    { x: lerp(xL, 12, 0.33), y: lerp(6.5, 14, 0.33) },
    { x: lerp(xL, 12, 0.66), y: lerp(6.5, 14, 0.66) },
    { x: 12, y: 14 },
    { x: lerp(12, xR, 0.33), y: lerp(14, 6.5, 0.33) },
    { x: lerp(12, xR, 0.66), y: lerp(14, 6.5, 0.66) },
    { x: xR, y: 6.5 },
  ];
  toSegments(flapPts).forEach((s) => outline.push(s));

  const dotPts = arc(21, 5, 5.5, 0, Math.PI * 2, 20);
  toSegments(dotPts).forEach((s) => outline.push(s));

  const checkPts: Point[] = [
    { x: 18, y: 4.75 },
    { x: lerp(18, 20, 0.5), y: lerp(4.75, 6.75, 0.5) },
    { x: 20, y: 6.75 },
    { x: lerp(20, 23.5, 0.5), y: lerp(6.75, 3.25, 0.5) },
    { x: 23.5, y: 3.25 },
  ];
  toSegments(checkPts).forEach((s) => checkmark.push(s));

  return {
    outline: withOffsets(outline),
    checkmark: withOffsets(checkmark),
  };
}

const spring = { type: "spring" as const, stiffness: 220, damping: 14 };

export function LogoFormation({ onComplete }: { onComplete?: () => void }) {
  const { outline, checkmark } = useMemo(() => generateSegments(), []);

  return (
    <svg
      width="280"
      height="280"
      viewBox="-2 -2 32 32"
      className="overflow-visible"
    >
      <motion.circle
        cx={21}
        cy={5}
        r={0}
        className="fill-primary"
        animate={{ r: 5.5 }}
        transition={{
          delay: outline.length * 0.018 + 0.15,
          duration: 0.35,
          ease: "easeOut",
        }}
      />

      {outline.map((seg, i) => (
        <motion.line
          key={`o-${i}`}
          x1={seg.target.x1 + seg.rOff}
          y1={seg.target.y1 + seg.rOff2}
          x2={seg.target.x2 + seg.rOff}
          y2={seg.target.y2 + seg.rOff2}
          stroke="currentColor"
          className="text-primary"
          strokeWidth="0.35"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{
            x1: seg.target.x1,
            y1: seg.target.y1,
            x2: seg.target.x2,
            y2: seg.target.y2,
            opacity: 1,
          }}
          transition={{
            ...spring,
            delay: i * 0.018,
            duration: 0.6,
          }}
        />
      ))}

      {checkmark.map((seg, i) => {
        const idx = outline.length + i;
        return (
          <motion.line
            key={`c-${i}`}
            x1={seg.target.x1 + seg.rOff}
            y1={seg.target.y1 + seg.rOff2}
            x2={seg.target.x2 + seg.rOff}
            y2={seg.target.y2 + seg.rOff2}
            stroke="white"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ opacity: 0 }}
            animate={{
              x1: seg.target.x1,
              y1: seg.target.y1,
              x2: seg.target.x2,
              y2: seg.target.y2,
              opacity: 1,
            }}
            transition={{
              ...spring,
              delay: idx * 0.018 + 0.35,
              duration: 0.45,
            }}
            onAnimationComplete={
              i === checkmark.length - 1
                ? () => setTimeout(() => onComplete?.(), 200)
                : undefined
            }
          />
        );
      })}
    </svg>
  );
}
