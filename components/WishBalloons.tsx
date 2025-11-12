"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Balloon = {
  id: number;
  x: number; // percent
  size: number; // px base
  color: string;
  wish: string;
  duration: number;
  delay: number;
  drift: number; // x drift px
  popped?: boolean;
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const WISHES = [
  "May all your dreams come true",
  "Another year of adventures",
  "Keep shining bright",
  "Health, joy, and laughter",
  "You are loved so much",
  "Make a wish!",
  "To sweet surprises",
  "Cheers to you",
  "More sunsets together",
  "Dream big, sparkle more",
  "Cake first, always",
  "Magic in every moment",
  "Smiles for miles",
  "Hugs, love, confetti",
  "Today is your day",
];

function useWindowSize() {
  const [s, setS] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const onR = () => setS({ width: window.innerWidth, height: window.innerHeight });
    onR();
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  return s;
}

const COLORS = ["var(--lavender)", "var(--coral)", "var(--gold)"] as const;

export default function WishBalloons({ count = 12, className = "" }: { count?: number; className?: string }) {
  const { height } = useWindowSize();
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const nextId = useRef(1);

  const makeBalloon = (): Balloon => ({
    id: nextId.current++,
    x: 8 + Math.random() * 84,
    size: 70 + Math.random() * 40,
    color: COLORS[Math.floor(Math.random() * COLORS.length)] as string,
    wish: WISHES[Math.floor(Math.random() * WISHES.length)],
    duration: 12 + Math.random() * 10,
    delay: Math.random() * 3,
    drift: (Math.random() - 0.5) * 60,
  });

  // initial balloons
  useEffect(() => {
    setBalloons(Array.from({ length: count }).map(() => makeBalloon()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  const regen = (id: number) =>
    setBalloons((arr) => arr.map((b) => (b.id === id ? makeBalloon() : b)));

  const pop = (id: number) =>
    setBalloons((arr) => arr.map((b) => (b.id === id ? { ...b, popped: true } : b)));

  const H = Math.max(height || 0, 800);

  return (
    <div className={`relative h-[60vh] w-full overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-transparent" />

      {balloons.map((b) => (
        <BalloonItem key={b.id} b={b} H={H} onPop={pop} onRegen={regen} />
      ))}
    </div>
  );
}

function BalloonItem({
  b,
  H,
  onPop,
  onRegen,
}: {
  b: Balloon;
  H: number;
  onPop: (id: number) => void;
  onRegen: (id: number) => void;
}) {
  const startY = H / 2 + Math.random() * (H / 2);
  const endY = -200 - b.size;
  const [exploding, setExploding] = useState(false);

  useEffect(() => {
    if (b.popped) {
      setExploding(true);
      const t = setTimeout(() => {
        setExploding(false);
        onRegen(b.id);
      }, 1100);
      return () => clearTimeout(t);
    }
  }, [b.popped, b.id, onRegen]);

  const shortWish = useMemo(() => (b.wish.length > 18 ? b.wish.slice(0, 16) + "…" : b.wish), [b.wish]);

  return (
    <div className="absolute" style={{ left: `${b.x}%`, bottom: -startY }}>
      <AnimatePresence mode="wait">
        {!b.popped ? (
          <motion.button
            key="balloon"
            className="relative block outline-none"
            initial={{ y: 0, opacity: 1, x: 0 }}
            animate={{ y: [0, endY], x: [0, b.drift, 0] }}
            transition={{ duration: b.duration, delay: b.delay, ease: EASE }}
            onAnimationComplete={() => onRegen(b.id)}
            onClick={() => onPop(b.id)}
          >
            <svg viewBox="0 0 100 140" width={b.size} height={b.size * 1.4} aria-label="Wish balloon">
              <defs>
                <radialGradient id={`g-${b.id}`} cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                  <stop offset="60%" stopColor={b.color} stopOpacity="0.95" />
                  <stop offset="100%" stopColor={b.color} />
                </radialGradient>
              </defs>
              <ellipse cx="50" cy="60" rx="40" ry="50" fill={`url(#g-${b.id})`} />
              <path d="M50 110 L46 118 L54 118 Z" fill={b.color} />
              <path d="M50 118 C 50 140, 45 140, 45 160" stroke={b.color} strokeWidth="2" fill="none" />
            </svg>
            {/* wish text */}
            <span className="pointer-events-none absolute left-1/2 top-[42%] w-[72%] -translate-x-1/2 -translate-y-1/2 text-center text-xs font-semibold text-black/80 drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]">
              {shortWish}
            </span>
          </motion.button>
        ) : (
          <motion.div
            key="pop"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            <Particles color={b.color} show={exploding} text={b.wish} size={b.size} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Particles({ color, show, text, size }: { color: string; show: boolean; text: string; size: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        angle: (i / 24) * Math.PI * 2,
        r: 10 + Math.random() * (size / 1.8),
        dur: 0.6 + Math.random() * 0.5,
      })),
    [size]
  );
  return (
    <div className="relative" style={{ width: size, height: size * 1.4 }}>
      {/* wish reveal card */}
      <motion.div
        className="absolute left-1/2 top-1/2 w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-black/10 bg-white/90 p-3 text-center text-sm shadow-sm backdrop-blur dark:border-white/15 dark:bg-black/60"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <span className="font-[var(--font-handwritten),cursive] text-coral">{text}</span>
      </motion.div>
      {/* particle burst */}
      {show && (
        <div className="pointer-events-none absolute inset-0">
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute block h-2 w-2 rounded-full"
              style={{ background: color, left: size / 2, top: (size * 1.4) / 2 }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos(p.angle) * p.r,
                y: Math.sin(p.angle) * p.r,
                opacity: 0,
                scale: 0.8,
              }}
              transition={{ duration: p.dur, ease: EASE }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
