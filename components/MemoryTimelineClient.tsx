"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";

export type MemoryPhoto = {
  src: string;
  caption: string;
  width?: number;
  height?: number;
};

export type YearMemories = {
  year: number;
  photos: MemoryPhoto[];
};

export default function MemoryTimelineClient({ groups }: { groups: YearMemories[] }) {
  const total = useMemo(() => groups.reduce((acc, g) => acc + g.photos.length, 0), [groups]);
  // Expanded view by default for all years
  const [openYears, setOpenYears] = useState<Set<number>>(
    () => new Set(groups.map((_, idx) => idx))
  );
  const toggleYear = (idx: number) =>
    setOpenYears((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });

  // Lightbox state
  const [lightbox, setLightbox] = useState<{ open: boolean; yearIdx: number; photoIdx: number } | null>(null);

  const openLightbox = (yearIdx: number, photoIdx: number) => setLightbox({ open: true, yearIdx, photoIdx });
  const closeLightbox = () => setLightbox(null);
  const next = () =>
    setLightbox((lb) =>
      lb ? { ...lb, photoIdx: (lb.photoIdx + 1) % (groups[lb.yearIdx]?.photos.length || 1) } : lb
    );
  const prev = () =>
    setLightbox((lb) =>
      lb
        ? { ...lb, photoIdx: (lb.photoIdx - 1 + (groups[lb.yearIdx]?.photos.length || 1)) % (groups[lb.yearIdx]?.photos.length || 1) }
        : lb
    );

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-12">
      {/* Top summary */}
      <div className="mb-8 flex items-center justify-between pl-12 sm:pl-16">
        <h3 className="text-2xl font-bold text-deeppurple">Memory Timeline</h3>
        <div className="rounded-full border border-black/10 px-4 py-1 text-sm dark:border-white/15">
          Our Favorite Moments: <span className="font-semibold">{total}</span>
        </div>
      </div>

      {/* Vertical lavender line */}
      <div className="pointer-events-none absolute left-6 top-0 h-full w-px bg-primary/70 sm:left-8" />

      <div className="space-y-12">
        {groups.map((g, idx) => (
          <YearCard
            key={g.year}
            group={g}
            index={idx}
            isOpen={openYears.has(idx)}
            onToggle={() => toggleYear(idx)}
            onOpenLightbox={(photoIdx) => openLightbox(idx, photoIdx)}
          />
        ))}
      </div>

      {/* Lightbox overlay */}
      <Lightbox
        open={!!lightbox}
        photo={lightbox ? groups[lightbox.yearIdx]?.photos[lightbox.photoIdx] : undefined}
        onClose={closeLightbox}
        onPrev={prev}
        onNext={next}
      />
    </div>
  );
}

function YearCard({
  group,
  index,
  isOpen,
  onToggle,
  onOpenLightbox,
}: {
  group: YearMemories;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onOpenLightbox: (photoIdx: number) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const [order, setOrder] = useState<number[]>(() => Array.from({ length: group.photos.length }, (_, i) => i));

  // Shuffle photos whenever this year becomes selected/open
  useEffect(() => {
    if (isOpen && group.photos.length > 1) {
      const idxs = Array.from({ length: group.photos.length }, (_, i) => i);
      for (let i = idxs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [idxs[i], idxs[j]] = [idxs[j], idxs[i]];
      }
      setOrder(idxs);
    }
  }, [isOpen, group.photos.length]);

  return (
    <motion.section
      ref={ref}
      style={{ y }}
      className="relative ml-12 rounded-3xl bg-white/60 p-4 shadow-lavender-2xl ring-1 ring-black/5 backdrop-blur dark:bg-black/40 dark:ring-white/10 sm:ml-16 sm:p-6"
    >
      {/* Timeline node */}
      <div className="absolute -left-12 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-black shadow ring-2 ring-white/70 dark:ring-black/40 sm:-left-14 sm:h-12 sm:w-12">
        <span className="text-[11px] font-extrabold sm:text-sm">{group.year}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-semibold text-deeppurple sm:text-2xl">{group.year}</h3>
        <button
          onClick={onToggle}
          className="group rounded-full border border-black/10 px-3 py-1 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
        >
          <span className="mr-1 align-middle">{isOpen ? "Hide" : "View"}</span>
          <span className="inline-block transition-transform group-hover:translate-x-0.5">{isOpen ? "▲" : "▼"}</span>
        </button>
      </div>

      {/* Preview strip */}
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {order.slice(0, 4).map((ordIdx, i) => {
          const p = group.photos[ordIdx];
          return (
            <button
              key={i}
              onClick={() => onOpenLightbox(ordIdx)}
              className="h-20 w-28 shrink-0 overflow-hidden rounded-md border border-black/10 bg-white/60 shadow-sm transition-transform hover:scale-[1.02] dark:border-white/15"
            >
              <Image
                src={p.src}
                alt={p.caption}
                width={224}
                height={160}
                className="h-full w-full object-cover"
                sizes="(max-width: 640px) 50vw, 224px"
                loading="lazy"
              />
            </button>
          );
        })}
      </div>

      {/* Expandable masonry grid */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="mt-5"
          >
            <div className="columns-1 gap-4 sm:columns-2 md:columns-3">
              {order.slice(0, 12).map((ordIdx, i) => (
                <Polaroid key={ordIdx} photo={group.photos[ordIdx]} index={i} onOpen={() => onOpenLightbox(ordIdx)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function Polaroid({ photo, index, onOpen }: { photo: MemoryPhoto; index: number; onOpen: () => void }) {
  const tilt = useMemo(() => (index % 2 === 0 ? "-rotate-1" : "rotate-1"), [index]);
  const [loaded, setLoaded] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [lastTap, setLastTap] = useState<number>(0);

  const onDoubleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      // place heart at click position
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = now + Math.random();
      setHearts((h) => [...h, { id, x, y }]);
      setTimeout(() => setHearts((h) => h.filter((hh) => hh.id !== id)), 900);
    }
    setLastTap(now);
  };

  return (
    <div className={`mb-4 break-inside-avoid p-3 ${tilt}`}>
      <div
        className="group rounded-md bg-white p-2 shadow-[0_6px_18px_rgba(0,0,0,0.12)] transition-transform duration-300 hover:scale-[1.015]"
        onDoubleClick={onDoubleTap}
        onClick={onOpen}
      >
        <div className="relative overflow-hidden rounded-sm">
          <Image
            src={photo.src}
            alt={photo.caption}
            width={photo.width ?? 800}
            height={photo.height ?? 600}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`h-auto w-full transform object-cover transition-all duration-700 ${loaded ? "scale-100 blur-0" : "scale-[1.03] blur-sm"}`}
            onLoad={() => setLoaded(true)}
            loading="lazy"
          />
          {/* hearts */}
            {hearts.map((h) => (
            <motion.span
              key={h.id}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-coral drop-shadow-[0_0_10px_rgba(255,107,157,0.6)]"
              style={{ left: h.x, top: h.y }}
              initial={{ opacity: 0.8, scale: 0.6 }}
              animate={{ opacity: 0, scale: 1.6, y: -20 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              ❤
            </motion.span>
          ))}
        </div>
        <div className="mt-2 text-center text-sm text-black wrap-break-word font-[var(--font-handwritten),cursive]">
          {photo.caption}
        </div>
      </div>
    </div>
  );
}

function Lightbox({
  open,
  photo,
  onClose,
  onPrev,
  onNext,
}: {
  open: boolean;
  photo?: MemoryPhoto;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [lastTap, setLastTap] = useState<number>(0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onNext, onPrev]);

  const onDoubleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = now + Math.random();
      setHearts((h) => [...h, { id, x, y }]);
      setTimeout(() => setHearts((h) => h.filter((hh) => hh.id !== id)), 1000);
    }
    setLastTap(now);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative h-[80vh] w-[92vw] max-w-5xl overflow-hidden rounded-xl bg-black/30 ring-1 ring-white/10"
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={onDoubleTap}
          >
            <div className="absolute inset-0">
              <AnimatePresence mode="wait">
                <motion.div key={photo?.src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {photo && (
                    <Image src={photo.src} alt={photo.caption} fill priority className="object-contain" sizes="100vw" />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* hearts */}
            {hearts.map((h) => (
              <motion.span
                key={h.id}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-coral text-5xl drop-shadow-[0_0_14px_rgba(255,107,157,0.7)]"
                style={{ left: h.x, top: h.y }}
                initial={{ opacity: 0.9, scale: 0.6 }}
                animate={{ opacity: 0, scale: 1.7, y: -40 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                ❤
              </motion.span>
            ))}

            {/* controls */}
            <button
              onClick={onPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white ring-1 ring-white/10 hover:bg-black/60"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              onClick={onNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white ring-1 ring-white/10 hover:bg-black/60"
              aria-label="Next"
            >
              ›
            </button>
            <button
              onClick={onClose}
              className="absolute right-2 top-2 rounded-full bg-black/40 px-3 py-1 text-white ring-1 ring-white/10 hover:bg-black/60"
              aria-label="Close"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
