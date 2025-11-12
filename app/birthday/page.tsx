"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Music2, VolumeX } from "lucide-react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const BirthdayMessage = dynamic(() => import("@/components/BirthdayMessage"), { ssr: false });
const BirthdayCountdown = dynamic(() => import("@/components/BirthdayCountdown"), { ssr: false });
const FinalSurprise = dynamic(() => import("@/components/FinalSurprise"), { ssr: false });

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

function Particles({ count = 40 }: { count?: number }) {
  const { height } = useWindowSize();
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 6 + Math.random() * 10,
        duration: 10 + Math.random() * 10,
        delay: Math.random() * 5,
  drift: (Math.random() - 0.5) * 40,
  color: Math.random() > 0.5 ? "var(--lavender)" : "var(--blush)",
      })),
    [count]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full blur-[2px] shadow-[0_0_12px_rgba(0,0,0,0.05)]"
          style={{ left: `${p.left}%`, width: p.size, height: p.size, background: p.color, bottom: -20 }}
          initial={{ y: 0, opacity: 0.0, x: 0 }}
          animate={{ y: [0, -Math.max(height || 0, 800) * 1.2], opacity: [0, 0.9, 0], x: [0, p.drift] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function CakeSVG() {
  // Simple layered cake with 5 candles centered on the top layer
  const TOP_X = 120;
  const TOP_Y = 90;
  const TOP_W = 120;
  const CANDLE_W = 8;
  const CANDLE_COUNT = 5;
  const BASE_Y = 62; // so that BASE_Y + candle height (28) ≈ top layer y (90)
  const candles = Array.from({ length: CANDLE_COUNT }).map((_, i) => ({
    // evenly space candle centers across the top layer
    cx: TOP_X + ((i + 1) * TOP_W) / (CANDLE_COUNT + 1),
  }));
  return (
    <svg
      width="360"
      height="260"
      viewBox="0 0 360 260"
      className="drop-shadow-[0_8px_32px_rgba(0,0,0,0.15)]"
      aria-label="Animated birthday cake"
    >
      {/* plate */}
      <ellipse cx="180" cy="230" rx="130" ry="18" fill="#eaeafc" />

      {/* bottom layer */}
      <rect x="60" y="160" width="240" height="60" rx="16" fill="#ffd1dc" />
      <rect x="60" y="150" width="240" height="22" rx="12" fill="#ffb6c1" />

      {/* middle layer */}
      <rect x="85" y="120" width="190" height="50" rx="14" fill="#ffe6f0" />
      <rect x="85" y="112" width="190" height="18" rx="10" fill="#ffc0cb" />

  {/* top layer */}
  <rect x={TOP_X} y={TOP_Y} width={TOP_W} height="40" rx="12" fill="#fff0f5" />
  <rect x={TOP_X} y={TOP_Y - 6} width={TOP_W} height="14" rx="8" fill="#ffccda" />

      {/* icing drips */}
      <path d="M120 98 C 135 120, 145 110, 160 98 C 170 120, 190 120, 200 98 C 210 120, 230 115, 240 98" fill="#ffccda" />

      {/* candles */}
      {candles.map((c, i) => (
        <g key={i} transform={`translate(${c.cx - CANDLE_W / 2}, ${BASE_Y})`}>
          <rect x="0" y="0" width={CANDLE_W} height="28" rx="3" fill="#8ecae6" />
          <rect x="2" y="-3" width="4" height="6" rx="2" fill="#ff9f1c" />
          {/* flame */}
          <motion.path
            d="M4 -8 C 0 -4, 2 -1, 4 0 C 6 -1, 8 -4, 4 -8 Z"
            fill="#ffd700"
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: [0.7, 1, 0.8], scale: [1, 1.15, 1], translateX: [0, 0.6, 0] }}
            transition={{ duration: 0.9 + (i % 3) * 0.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>
      ))}

      {/* sprinkles (subtle animated, not static confetti) */}
      {Array.from({ length: 22 }).map((_, i) => {
        const x = 70 + Math.random() * 220;
        const y = 165 + Math.random() * 40;
        const rot = Math.random() * 60 - 30;
  const color = i % 3 === 0 ? "var(--lavender)" : i % 3 === 1 ? "var(--coral)" : "var(--gold)";
        const idur = 2 + Math.random() * 2.5;
        const delay = Math.random() * 1.5;
        return (
          <motion.rect
            key={i}
            x={x}
            y={y}
            width={3}
            height={8}
            rx={1}
            fill={color}
            opacity={0.85}
            transform={`rotate(${rot}, ${x}, ${y})`}
            initial={{ y }}
            animate={{ y: [y, y + 4, y], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: idur, delay, repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}
    </svg>
  );
}

export default function BirthdayPage() {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(true);
  const [recycleConfetti, setRecycleConfetti] = useState(true);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Let confetti animate for a bit, then stop recycling and finally hide
    const r = setTimeout(() => setRecycleConfetti(false), 2000);
    const h = setTimeout(() => setShowConfetti(false), 3300);
    return () => {
      clearTimeout(r);
      clearTimeout(h);
    };
  }, []);

  const toggleMusic = async () => {
    if (!audioRef.current) return;
    try {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.volume = 0.25;
        await audioRef.current.play();
        setPlaying(true);
      }
    } catch (e) {
      // likely autoplay/permissions or missing file
      console.warn("Unable to play audio. Add /public/birthday-song.mp3 or interact first.", e);
    }
  };

  // Framer Motion variants for staggered sections
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.15 } },
  };
  const item = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 16 } },
  } as const;

  // Replace this with the real birth year for an accurate age
  const BIRTH_YEAR = 2003; // TODO: set the correct year
  const BIRTH_MONTH = 11; // 1-12 (aligns with visual display)
  const BIRTH_DAY = 12;
  const today = new Date();
  const birthdayThisYear = new Date(today.getFullYear(), BIRTH_MONTH - 1, BIRTH_DAY);
  let age = today.getFullYear() - BIRTH_YEAR - (today < birthdayThisYear ? 1 : 0);

  return (
    <div className="relative min-h-dvh scroll-smooth text-foreground">
      {/* animated gradient background */}
      <div className="animated-gradient absolute inset-0 -z-10" aria-hidden />
      <Particles count={width && width < 640 ? 18 : 40} />

      {/* confetti burst */}
      {showConfetti && width > 0 && height > 0 && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={width < 640 ? 120 : 240}
          gravity={0.3}
          recycle={recycleConfetti}
          run={showConfetti}
        />
      )}

      {/* top controls */}
      <div className="pointer-events-auto fixed right-4 top-4 z-20 flex items-center gap-2">
        <button
          onClick={toggleMusic}
          className="flex items-center gap-2 rounded-full bg-black/5 px-4 py-2 text-sm shadow-sm ring-1 ring-black/10 backdrop-blur hover:bg-black/10 dark:bg-white/10 dark:ring-white/15 dark:hover:bg-white/15"
        >
          {playing ? <Music2 size={18} /> : <VolumeX size={18} />}
          <span>{playing ? "Music On" : "Music Off"}</span>
        </button>
      </div>

      {/* hidden audio element: place your audio at public/birthday-song.mp3 */}
      <audio ref={audioRef} src="/birthday-song.mp3" loop preload="none" />

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-16">
        {/* HERO */}
        <section id="hero" className="flex min-h-[80vh] flex-col items-center justify-center gap-6 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 16 }}>
            <CakeSVG />
          </motion.div>
          {/* Heading + subtitle with controlled inner spacing */}
          <div className="flex flex-col items-center space-y-6 sm:space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 16, delay: 0.05 }}
              className="heading-font text-4xl font-extrabold tracking-tight text-deeppurple drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)] sm:text-5xl md:text-6xl"
            >
              Happy Birthday, Meryem 💜
            </motion.h1>
            <p className="mx-auto mt-1 max-w-prose rounded-full bg-white/70 px-4 py-2 text-charcoal ring-1 ring-black/5 backdrop-blur-sm dark:bg-black/40 dark:text-white/90 dark:ring-white/10">
              Wishing you a day filled with love, laughter, and the sweetest memories.
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a
              href="#birthday-wish"
              className="btn rounded-full bg-coral px-5 py-2 text-center font-semibold text-white shadow-[0_0_18px_rgba(230,230,250,0.6)] hover:bg-coral/90 ring-1 ring-periwinkle/40"
            >
              Click here to see your birthday message
            </a>
            <a
              href="/memories"
              className="btn rounded-full border border-black/10 px-5 py-2 text-center hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              Sweet Moments
            </a>
          </div>
        </section>

        {/* CONTENT with stagger */}
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="mt-24 space-y-24">
          {/* Personalized message section */}
          <motion.section id="birthday-wish" variants={item} className="scroll-mt-24">
            <BirthdayMessage
              title="Your Birthday Wish"
              message="Meryem, you brighten every room with your kindness and sparkle. Here’s to more wonder, more laughter, and more adventures together — today and always."
              quotes={[]}
              minimal
            />
          </motion.section>

          {/* Removed Make A Wish section as requested */}

          {/* Countdown section */}
          <motion.section variants={item} className="rounded-3xl bg-white/60 p-6 shadow-lavender-2xl ring-1 ring-black/5 backdrop-blur dark:bg-black/40 dark:ring-white/10">
            <h2 className="mb-2 text-center text-2xl font-bold text-deeppurple">Countdown ⏳</h2>
            <BirthdayCountdown month={10} day={12} quote="Friendship doubles our joy and divides our sorrow." />
          </motion.section>

          {/* Final Surprise section */}
          <motion.section variants={item} id="final" className="scroll-mt-24">
            <FinalSurprise friendName="Meryem" yourName="Your Friend" age={age} />
          </motion.section>
        </motion.div>
      </main>

      {/* component-scoped styles for gradient animation */}
      <style jsx>{`
        .animated-gradient {
          background-image: linear-gradient(120deg, var(--lavender), var(--blush), var(--peach));
          background-size: 300% 300%;
          animation: gradient-move 18s ease-in-out infinite;
        }
        @keyframes gradient-move {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
