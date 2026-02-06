"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { useTransition } from "./TransitionProvider";

type MediaQueryListLegacy = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const { isTransitioning } = useTransition();
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)") as MediaQueryListLegacy;

    const destroy = () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };

    const setup = () => {
      if (mq.matches) {
        destroy();
        return;
      }
      if (lenisRef.current) return;
      const lenis = new Lenis({
        duration: 1.3,
        easing: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
        smoothWheel: true,
        smoothTouch: false,
      });
      lenisRef.current = lenis;
      const raf = (time: number) => {
        lenis.raf(time);
        rafRef.current = window.requestAnimationFrame(raf);
      };
      rafRef.current = window.requestAnimationFrame(raf);
    };

    setup();
    mq.addEventListener?.("change", setup);
    mq.addListener?.(setup);

    return () => {
      mq.removeEventListener?.("change", setup);
      mq.removeListener?.(setup);
      destroy();
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (isTransitioning) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [isTransitioning]);

  return <>{children}</>;
}
