"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Tiny hook to get viewport size on client only
function useWindowSize() {
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  useEffect(() => {
    function onResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

// Simple typewriter effect for the main heading
// Emoji-safe: iterate over grapheme clusters instead of UTF-16 code units
function Typewriter({ text, speed = 60 }: { text: string; speed?: number }) {
  // Precompute graphemes once for the given text
  const graphemes = useMemo<string[]>(() => {
    if (typeof (Intl as any)?.Segmenter === "function") {
      return Array.from(new (Intl as any).Segmenter(undefined, { granularity: "grapheme" }).segment(text), (s: any) => s.segment);
    }
    return Array.from(text);
  }, [text]);

  const [index, setIndex] = useState(0);
  useEffect(() => {
    setIndex(0);
    const id = window.setInterval(() => {
      setIndex((i) => {
        if (i + 1 >= graphemes.length) {
          window.clearInterval(id);
        }
        return Math.min(i + 1, graphemes.length);
      });
    }, speed);
    return () => window.clearInterval(id);
  }, [graphemes, speed]);

  return (
    <span aria-label={text} style={{ whiteSpace: "pre-wrap" }}>
      {graphemes.slice(0, index).join("")}
      <span aria-hidden className="ml-1 inline-block w-3 animate-pulse border-l-2 border-current" />
    </span>
  );
}

// Background twinkling stars
function Stars({ count = 60 }: { count?: number }) {
  const { width, height } = useWindowSize();
  const stars = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 4,
        dur: Math.random() * 3 + 2,
      })),
    [count]
  );
  // Re-render only when viewport available
  if (!width || !height) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s) => (
        <motion.span
          key={s.id}
          className="absolute rounded-full bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.8)]"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// Client-only balloons to avoid SSR randomness mismatches
const Balloons = dynamic(() => import("@/components/LandingBalloons"), { ssr: false });

// Sparkle overlay shown before navigating
function SparkleOverlay({ show }: { show: boolean }) {
  const sparkles = useMemo(
    () =>
      Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        scale: 0.4 + Math.random() * 1.3,
        delay: Math.random() * 0.4,
      })),
    []
  );
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-[1px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="pointer-events-none absolute inset-0">
            {sparkles.map((s) => (
              <motion.span
                key={s.id}
                className="absolute text-gold drop-shadow-[0_0_6px_rgba(255,215,0,0.8)]"
                style={{ left: `${s.x}%`, top: `${s.y}%` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, s.scale, 0] }}
                transition={{ duration: 0.8, delay: s.delay, ease: "easeOut" }}
              >
                ✦
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { width, height } = useWindowSize();
  const [confetti, setConfetti] = useState(true);
  const [showSparkles, setShowSparkles] = useState(false);

  // stop confetti after a short celebration
  useEffect(() => {
    const id = setTimeout(() => setConfetti(false), 3000);
    return () => clearTimeout(id);
  }, []);

  // handle CTA click
  const onOpenGift = () => {
    if (showSparkles) return;
    setShowSparkles(true);
    // give sparkles time to play before navigating
    setTimeout(() => router.push("/birthday"), 1100);
  };

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-lavender-gradient text-foreground">
      {/* celebratory confetti */}
      {confetti && width > 0 && height > 0 && (
        <Confetti width={width} height={height} numberOfPieces={280} gravity={0.25} recycle={false} />
      )}

      {/* ambient background */}
      <Stars count={70} />
      <Balloons />

      {/* center content */}
      <main className="relative z-10 mx-auto flex min-h-dvh max-w-4xl flex-col items-center justify-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 16 }}
          className="heading-font no-liga mb-8 bg-clip-text text-4xl font-extrabold tracking-tight text-deeppurple drop-shadow-[0_0_18px_rgba(230,230,250,0.65)] sm:text-5xl md:text-6xl"
        >
          <Typewriter text="Happy Birthday Meryem!💜" speed={55} />
        </motion.h1>

        <motion.button
          onClick={onOpenGift}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: [1, 1.03, 1] }}
          transition={{ duration: 0.9, delay: 0.3, repeat: Infinity, repeatType: "reverse" }}
          className="group relative rounded-full bg-coral px-8 py-4 text-lg font-semibold text-white shadow-[0_0_24px_rgba(230,230,250,0.75)] ring-2 ring-periwinkle/70 backdrop-blur-sm hover:bg-coral/90 hover:shadow-[0_0_40px_rgba(230,230,250,0.95)] focus:outline-none"
        >
          <span className="relative z-10">Open Your Gift</span>
          {/* glowing aura */}
          <span className="pointer-events-none absolute inset-0 z-0 rounded-full bg-coral/30 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
        </motion.button>
      </main>

      {/* sparkle overlay */}
      <SparkleOverlay show={showSparkles} />
    </div>
  );
}
