"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, PartyPopper, Share2, Facebook, Twitter, MessageCircle } from "lucide-react";

type Props = {
  friendName?: string; // Birthday person's name
  yourName?: string; // Sender's name
  age?: number; // If provided, used directly; else computed from birthdate
  birthdate?: string | Date; // e.g. "2003-11-12" or Date
  shareUrl?: string; // Custom URL to share (defaults to current location on client)
  className?: string;
};

function computeAge(birthdate: Date | undefined): number | undefined {
  if (!birthdate || Number.isNaN(birthdate.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birthdate.getMonth() ||
    (today.getMonth() === birthdate.getMonth() && today.getDate() >= birthdate.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export default function FinalSurprise({
  friendName = "Meryem",
  yourName = "Your Friend",
  age,
  birthdate,
  shareUrl,
  className,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [runOnce, setRunOnce] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Resolve age if not provided
  const resolvedAge = useMemo(() => {
    if (typeof age === "number") return age;
    let d: Date | undefined;
    if (birthdate) d = typeof birthdate === "string" ? new Date(birthdate) : birthdate;
    return computeAge(d);
  }, [age, birthdate]);

  // Resolve share URL on client
  const urlToShare = useMemo(() => {
    if (shareUrl) return shareUrl;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  }, [shareUrl]);

  useEffect(() => setMounted(true), []);

  // Lightweight fireworks using canvas-confetti
  const launchFireworks = useCallback(async () => {
    if (!mounted) return;
    const { default: confetti } = await import("canvas-confetti");
    const duration = 4000;
    const end = Date.now() + duration;

    const $canvas = canvasRef.current;
    const myConfetti = confetti.create($canvas || undefined, { resize: true, useWorker: true });

    // Resolve theme colors from CSS variables for palette consistency
    const root = getComputedStyle(document.documentElement);
    const lavender = (root.getPropertyValue("--lavender") || "#E6E6FA").trim();
    const blush = (root.getPropertyValue("--blush") || "#FFB3D9").trim();
    const gold = (root.getPropertyValue("--gold") || "#FFD700").trim();

    (function frame() {
      myConfetti({
        particleCount: 3,
        angle: 60,
        spread: 65,
        origin: { x: 0 },
        ticks: 200,
        colors: [lavender, blush, gold, "#ffffff"],
      });
      myConfetti({
        particleCount: 3,
        angle: 120,
        spread: 65,
        origin: { x: 1 },
        ticks: 200,
        colors: [lavender, blush, gold, "#ffffff"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, [mounted]);

  // Run once upon mount for a celebratory burst
  useEffect(() => {
    if (!mounted || runOnce) return;
    setRunOnce(true);
    launchFireworks();
  }, [mounted, runOnce, launchFireworks]);

  const onDownloadCertificate = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const cleanFriend = friendName.replace(/\s+/g, "_");
    const cleanYou = yourName.replace(/\s+/g, "_");
    a.href = url;
    a.download = `Friendship-Certificate-${cleanFriend}-and-${cleanYou}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [friendName, yourName]);

  const shareMessage = useMemo(() => {
    const ageText = typeof resolvedAge === "number" ? `${resolvedAge}` : "many";
    return `Cheers to ${ageText} year${ageText === "1" ? "" : "s"} of awesomeness! Happy Birthday, ${friendName}! 🎉🥳 — From ${yourName}`;
  }, [friendName, yourName, resolvedAge]);

  const onWebShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Happy Birthday!", text: shareMessage, url: urlToShare });
      } catch {
        // no-op if cancelled
      }
    }
  }, [shareMessage, urlToShare]);

  const encodedText = encodeURIComponent(shareMessage);
  const encodedUrl = encodeURIComponent(urlToShare);

  return (
  <section className={"relative overflow-hidden rounded-3xl bg-white/60 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur dark:bg-black/40 dark:ring-white/10 " + (className ?? "") }>
      {/* Fireworks Canvas */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold text-deeppurple">Final Surprise ✨</h2>
          <p className="text-balance text-lg font-semibold">
            {typeof resolvedAge === "number" ? (
              <>Cheers to <span className="text-deeppurple">{resolvedAge}</span> years of awesomeness!</>
            ) : (
              <>Cheers to <span className="text-deeppurple">another</span> year of awesomeness!</>
            )}
          </p>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={launchFireworks}
              className="btn inline-flex items-center gap-2 rounded-full bg-coral px-4 py-2 font-medium text-white shadow-sm ring-1 ring-periwinkle/40 hover:bg-coral/90"
            >
              <PartyPopper size={18} /> Celebrate
            </button>
            <button
              onClick={onDownloadCertificate}
              className="btn inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 font-medium hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              <Download size={18} /> Download Certificate
            </button>

            {typeof navigator !== "undefined" && (navigator as any).share ? (
              <button
                onClick={onWebShare}
                className="btn inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 font-medium hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                <Share2 size={18} /> Share
              </button>
            ) : null}
          </div>
        </div>

        {/* Certificate Preview (SVG) */}
        <div className="mt-6">
          <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm dark:border-white/15 dark:bg-black/30">
            <div className="aspect-[11/8.5] w-full rounded-xl bg-white/90 p-6 dark:bg-black/40">
              <svg
                ref={svgRef}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1100 850"
                width="100%"
                height="100%"
              >
                {/* Background gradient */}
                <defs>
                  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--off-white)" />
                    <stop offset="100%" stopColor="var(--blush)" />
                  </linearGradient>
                  <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--lavender)" />
                    <stop offset="100%" stopColor="var(--blush)" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="1100" height="850" fill="url(#bg)" />

                {/* Border */}
                <rect x="30" y="30" width="1040" height="790" rx="28" fill="none" stroke="var(--periwinkle)" strokeWidth="6" />
                <rect x="50" y="50" width="1000" height="750" rx="24" fill="none" stroke="url(#accent)" strokeWidth="8" />

                {/* Title */}
                <text x="550" y="180" textAnchor="middle" fontSize="56" fontWeight="700" fill="var(--deep-purple)">
                  Friendship Certificate
                </text>
                <text x="550" y="240" textAnchor="middle" fontSize="26" fill="var(--slate)">
                  Celebrating a bond sprinkled with confetti and stardust
                </text>

                {/* Names */}
                <text x="220" y="420" textAnchor="middle" fontSize="40" fontWeight="600" fill="var(--charcoal)">
                  {yourName}
                </text>
                <text x="880" y="420" textAnchor="middle" fontSize="40" fontWeight="600" fill="var(--charcoal)">
                  {friendName}
                </text>
                <text x="550" y="380" textAnchor="middle" fontSize="24" fill="var(--slate)">
                  and
                </text>

                {/* Ribbon */}
                <rect x="250" y="480" width="600" height="70" rx="18" fill="url(#accent)" opacity="0.9" />
                <text x="550" y="526" textAnchor="middle" fontSize="30" fontWeight="700" fill="var(--charcoal)">
                  Cheers to {typeof resolvedAge === "number" ? `${resolvedAge}` : "wonderful"} years!
                </text>

                {/* Footer */}
                <text x="200" y="700" textAnchor="middle" fontSize="18" fill="var(--slate)">
                  Signed: {yourName}
                </text>
                <text x="900" y="700" textAnchor="middle" fontSize="18" fill="var(--slate)">
                  For: {friendName}
                </text>
                <text x="550" y="760" textAnchor="middle" fontSize="16" fill="var(--slate)">
                  Issued on {new Date().toLocaleDateString()}
                </text>
              </svg>
            </div>
          </div>
        </div>

        {/* Fallback share buttons if Web Share API unavailable */}
        {!((typeof navigator !== "undefined") && (navigator as any).share) && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <a
              className="btn inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              <Twitter size={16} /> Share on X
            </a>
            <a
              className="btn inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              href={`https://wa.me/?text=${encodeURIComponent(shareMessage + " " + urlToShare)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a
              className="btn inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
            >
              <Facebook size={16} /> Facebook
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
