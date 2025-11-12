"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

type Props = {
  message?: string;
  quotes?: string[];
  title?: string;
  minimal?: boolean; // when true, show only the title and message
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function BirthdayMessage({
  title = "A Little Note",
  message = "Meryem, may your day be sprinkled with joy, warmed by love, and brightened by all the moments that make you smile.",
  quotes = [
    "Remember: cake calories don’t count today!",
    "Our legendary inside joke goes here—still hilarious.",
    "To more adventures, more laughs, and more lavender sunsets.",
  ],
  minimal = false,
}: Props) {
  const words = useMemo(() => message.split(/\s+/), [message]);
  return (
    <section className="relative mx-auto my-20 max-w-4xl px-6">
      {/* subtle glow behind */}
      <div
        className="pointer-events-none absolute -inset-12 -z-10 rounded-[48px] bg-[radial-gradient(60%_50%_at_30%_20%,rgba(230,230,250,0.55),transparent),radial-gradient(40%_35%_at_80%_30%,rgba(255,107,157,0.45),transparent),radial-gradient(40%_35%_at_60%_90%,rgba(255,215,0,0.25),transparent)] blur-2xl"
        aria-hidden
      />

  {/* Floating decor */}
  {!minimal && <FloatingDecors />}

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        className="rounded-3xl bg-white/60 p-8 shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-black/40 dark:ring-white/10"
      >
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-4 text-center text-3xl font-extrabold tracking-tight text-deeppurple"
        >
          {title}
        </motion.h2>

        {/* word-by-word message */}
        <p className="mx-auto max-w-prose text-center text-lg leading-8 text-foreground/90">
          {words.map((w, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
              className="inline-block"
            >
              <span className="mr-2 align-baseline">{w}</span>
            </motion.span>
          ))}
        </p>

        {/* highlighted inside jokes / quotes */}
        {!minimal && quotes.length > 0 && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {quotes.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: EASE }}
                className="rounded-2xl border border-periwinkle/50 bg-white/70 p-4 text-center text-foreground/90 shadow-sm backdrop-blur dark:bg-black/40"
              >
                <span className="font-[var(--font-handwritten),cursive] text-xl text-coral">“{q}”</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
}

function FloatingDecors() {
  const items = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        left: 5 + Math.random() * 90,
        top: 5 + Math.random() * 90,
        dur: 6 + Math.random() * 6,
        delay: Math.random() * 2,
        kind: i % 3, // 0 heart, 1 star, 2 balloon
      })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      {items.map((it) => (
        <motion.span
          key={it.id}
          className="absolute"
          style={{ left: `${it.left}%`, top: `${it.top}%` }}
          initial={{ y: 0, opacity: 0.6, rotate: -2 }}
          animate={{ y: [0, -10, 0], opacity: [0.6, 1, 0.6], rotate: [-2, 2, -2] }}
          transition={{ duration: it.dur, delay: it.delay, repeat: Infinity, ease: EASE }}
        >
          {it.kind === 0 ? (
            <span className="text-2xl text-coral drop-shadow-[0_0_8px_rgba(255,107,157,0.5)]">❤</span>
          ) : it.kind === 1 ? (
            <span className="text-xl text-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">✦</span>
          ) : (
            <svg width="26" height="36" viewBox="0 0 100 140" aria-hidden>
              <defs>
                <radialGradient id="g-msg" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                  <stop offset="60%" stopColor="var(--lavender)" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="var(--lavender)" />
                </radialGradient>
              </defs>
              <ellipse cx="50" cy="60" rx="40" ry="50" fill="url(#g-msg)" />
              <path d="M50 110 L46 118 L54 118 Z" fill="var(--lavender)" />
              <path d="M50 118 C 50 140, 45 140, 45 160" stroke="var(--lavender)" strokeWidth="2" fill="none" />
            </svg>
          )}
        </motion.span>
      ))}
    </div>
  );
}
