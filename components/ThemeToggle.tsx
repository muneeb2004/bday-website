"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effective = stored === "dark" || (!stored || stored === "system") && systemDark ? "dark" : "light";
    setIsDark(effective === "dark");
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    const root = document.documentElement;
    root.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      aria-label="Toggle dark mode"
      onClick={toggle}
      className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-foreground shadow-sm ring-1 ring-black/10 backdrop-blur hover:bg-black/10 dark:bg-white/10 dark:ring-white/15 dark:hover:bg-white/15"
    >
      {mounted && isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
