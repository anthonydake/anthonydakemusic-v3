"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// Simplified — no curtain, no scroll-lock, no fade, no mobile fallback
// distinction. `triggerTransition` is just `router.push` now; pages render
// fully visible on first paint (nothing is gated on JS). The API shape is
// preserved so existing callers compile.
type TransitionContextValue = {
  triggerTransition: (href: string) => void;
  isTransitioning: boolean;
  prefersReducedMotion: boolean;
  isMobileFallback: boolean;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransition must be used within TransitionProvider");
  return ctx;
}

type MediaQueryListLegacy = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

export default function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobileFallback, setIsMobileFallback] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)") as MediaQueryListLegacy;
    const update = () => setPrefersReducedMotion(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    mq.addListener?.(update);
    return () => {
      mq.removeEventListener?.("change", update);
      mq.removeListener?.(update);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: none), (pointer: coarse)") as MediaQueryListLegacy;
    const update = () => setIsMobileFallback(mq.matches);
    update();
    mq.addEventListener?.("change", update);
    mq.addListener?.(update);
    return () => {
      mq.removeEventListener?.("change", update);
      mq.removeListener?.(update);
    };
  }, []);

  const triggerTransition = useCallback(
    (href: string) => {
      if (!href) return;
      router.push(href);
    },
    [router]
  );

  const value = useMemo(
    () => ({
      triggerTransition,
      isTransitioning: false,
      prefersReducedMotion,
      isMobileFallback,
    }),
    [triggerTransition, prefersReducedMotion, isMobileFallback]
  );

  return <TransitionContext.Provider value={value}>{children}</TransitionContext.Provider>;
}
