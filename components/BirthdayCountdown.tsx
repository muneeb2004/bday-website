"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  month?: number; // 0-11
  day?: number; // 1-31
  title?: string;
  quote?: string;
  size?: number; // svg size px
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function getNextBirthday(now: Date, month: number, day: number) {
  const year = now.getFullYear();
  const candidate = new Date(year, month, day, 0, 0, 0, 0);
  return candidate <= now ? new Date(year + 1, month, day, 0, 0, 0, 0) : candidate;
}

function getPrevBirthday(now: Date, month: number, day: number) {
  const year = now.getFullYear();
  const candidate = new Date(year, month, day, 0, 0, 0, 0);
  return candidate <= now ? candidate : new Date(year - 1, month, day, 0, 0, 0, 0);
}

function diffBreakdown(to: Date, from: Date) {
  const ms = Math.max(0, to.getTime() - from.getTime());
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, totalSeconds };
}

function useCountdown(month: number, day: number) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const next = useMemo(() => getNextBirthday(now, month, day), [now, month, day]);
  const prev = useMemo(() => getPrevBirthday(now, month, day), [now, month, day]);
  const toNext = useMemo(() => diffBreakdown(next, now), [next, now]);
  const period = useMemo(() => diffBreakdown(next, prev), [next, prev]);
  const remainingPct = period.totalSeconds > 0 ? toNext.totalSeconds / period.totalSeconds : 0;
  const elapsedPct = 1 - remainingPct;
  return { next, prev, toNext, period, remainingPct, elapsedPct };
}

export default function BirthdayCountdown({
  month = 10, // November (0-indexed)
  day = 12,
  title = "Countdown to Your Next Birthday",
  quote = "True friends are the family we choose.",
  size = 180,
}: Props) {
  const { toNext, remainingPct, elapsedPct } = useCountdown(month, day);
  const radius = (size - 18) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * (1 - remainingPct);

  return (
    <section className="relative mx-auto my-12 max-w-4xl px-6">
      <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:items-center sm:gap-10">
        {/* Progress Ring */}
        <div className="relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
              <linearGradient id="bd-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--lavender)" />
                <stop offset="50%" stopColor="var(--coral)" />
                <stop offset="100%" stopColor="var(--gold)" />
              </linearGradient>
            </defs>
            <g transform={`translate(${size / 2}, ${size / 2})`}>
              {/* track */}
              <circle r={radius} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="10" />
              {/* progress */}
              <motion.circle
                r={radius}
                fill="none"
                stroke="url(#bd-grad)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dash}
                transform="rotate(-90)"
                initial={false}
                animate={{ strokeDashoffset: dash }}
                transition={{ duration: 0.6, ease: EASE }}
              />
            </g>
          </svg>
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="text-xs uppercase tracking-wide text-foreground/60">Days Left</div>
              <FlipNumber value={toNext.days} className="text-4xl font-extrabold text-deeppurple" />
            </div>
          </div>
        </div>

        {/* Detailed countdown */}
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
          <FlipCard label="Days" value={toNext.days} />
          <FlipCard label="Hours" value={toNext.hours} />
          <FlipCard label="Minutes" value={toNext.minutes} />
          <FlipCard label="Seconds" value={toNext.seconds} className="col-span-3 sm:col-span-1" />
        </div>
      </div>

      {/* Quote */}
      <motion.blockquote
        className="mx-auto mt-6 max-w-2xl rounded-2xl border border-periwinkle/50 bg-white/70 p-4 text-center text-foreground/90 shadow-sm backdrop-blur dark:bg-black/40"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <span className="font-[var(--font-handwritten),cursive] text-lg text-coral">“{quote}”</span>
      </motion.blockquote>
    </section>
  );
}

function FlipCard({ label, value, className = "" }: { label: string; value: number; className?: string }) {
  return (
    <div className={`rounded-xl bg-white/60 p-3 text-center shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-black/40 dark:ring-white/10 ${className}`}>
      <FlipNumber value={value} className="text-2xl font-bold text-deeppurple" />
      <div className="text-xs uppercase tracking-wide text-foreground/60">{label}</div>
    </div>
  );
}

function FlipNumber({ value, className = "" }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (value !== display) setDisplay(value);
  }, [value]);

  return (
    <div className={`relative h-[1.4em] perspective-midrange ${className}`} style={{ lineHeight: 1 }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={display}
          className="absolute inset-0 origin-bottom will-change-transform"
          initial={{ rotateX: 90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: -90, opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
          style={{ transformStyle: "preserve-3d" as any }}
        >
          {display.toString().padStart(2, "0")}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
