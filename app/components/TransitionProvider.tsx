"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import CurtainOverlay from "./CurtainOverlay";

type TransitionMode = "curtain" | "fade";
type TransitionPhase = "idle" | "covering" | "revealing";

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
  const pathname = usePathname();
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [mode, setMode] = useState<TransitionMode>("curtain");
  const [target, setTarget] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobileFallback, setIsMobileFallback] = useState(false);
  const navCommittedRef = useRef(false);

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
      if (phase !== "idle") return;
      const nextMode: TransitionMode = prefersReducedMotion || isMobileFallback ? "fade" : "curtain";
      setMode(nextMode);
      setTarget(href);
      navCommittedRef.current = false;
      setPhase("covering");
    },
    [phase, prefersReducedMotion, isMobileFallback]
  );

  useEffect(() => {
    if (phase === "idle") return;
    const prevent = (e: Event) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", "Space"].includes(e.code)) {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("touchmove", prevent, { passive: false });
    window.addEventListener("keydown", preventKeys);

    return () => {
      window.removeEventListener("wheel", prevent);
      window.removeEventListener("touchmove", prevent);
      window.removeEventListener("keydown", preventKeys);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "covering" && target && pathname === target) {
      setPhase("revealing");
    }
  }, [phase, target, pathname]);

  const handleCoverComplete = useCallback(() => {
    if (phase !== "covering") return;
    if (!target) return;
    if (navCommittedRef.current) return;
    navCommittedRef.current = true;
    router.push(target);
  }, [phase, target, router]);

  const handleRevealComplete = useCallback(() => {
    if (phase !== "revealing") return;
    setPhase("idle");
    setTarget(null);
  }, [phase]);

  const value = useMemo(
    () => ({
      triggerTransition,
      isTransitioning: phase !== "idle",
      prefersReducedMotion,
      isMobileFallback,
    }),
    [triggerTransition, phase, prefersReducedMotion, isMobileFallback]
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <CurtainOverlay
        phase={phase}
        mode={mode}
        onCoverComplete={handleCoverComplete}
        onRevealComplete={handleRevealComplete}
      />
    </TransitionContext.Provider>
  );
}
