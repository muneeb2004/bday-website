"use client";

import React, { useEffect } from "react";

// Lightweight theme application without external deps.
// Persists preference in localStorage under key "theme".
export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem("theme");
    const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effective = stored === "dark" || (!stored || stored === "system") && systemDark ? "dark" : "light";
    root.classList.toggle("dark", effective === "dark");
  }, []);
  return <>{children}</>;
}
