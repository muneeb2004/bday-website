"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

function useWindowSize() {
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

export default function LandingBalloons() {
  const { height } = useWindowSize();
  const h = Math.max(height || 0, 700);
  const colors = ["var(--lavender)", "var(--coral)", "var(--gold)"] as const;

  // Generate once per mount to avoid re-randomizing every render
  const balloons = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => ({
        id: i,
        color: colors[i % colors.length],
        x: 8 + Math.random() * 84,
        size: 60 + Math.random() * 26,
        dur: 10 + Math.random() * 6,
        delay: Math.random() * 3,
      })),
    []
  );

  // Render nothing until we know viewport height to avoid offscreen flicker
  if (!height) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {balloons.map((b) => (
        <motion.div
          key={b.id}
          className="absolute will-change-transform"
          style={{ left: `${b.x}%`, bottom: -120, width: b.size, height: b.size * 1.4 }}
          initial={{ y: 0, opacity: 0.95 }}
          animate={{ y: [0, -h * 1.1] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 100 140" width="100%" height="100%" aria-hidden>
            <defs>
              <radialGradient id={`g-${b.id}`} cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                <stop offset="60%" stopColor={String(b.color)} stopOpacity="0.95" />
                <stop offset="100%" stopColor={String(b.color)} />
              </radialGradient>
            </defs>
            <ellipse cx="50" cy="60" rx="40" ry="50" fill={`url(#g-${b.id})`} />
            <path d="M50 110 L46 118 L54 118 Z" fill={String(b.color)} />
            <path d="M50 118 C 50 140, 45 140, 45 160" stroke={String(b.color)} strokeWidth="2" fill="none" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
