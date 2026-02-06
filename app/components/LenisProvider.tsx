"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useTransition } from "./TransitionProvider";

type MediaQueryListLegacy = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const { isTransitioning } = useTransition();
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)") as MediaQueryListLegacy;
    const disableLenis = pathname.includes("/projects/");

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
      if (mq.matches || disableLenis) {
        destroy();
        return;
      }
      if (lenisRef.current) return;
      const lenis = new Lenis({
        duration: 0.8,
        easing: (t: number) => t,
        smoothWheel: true,
        wheelMultiplier: 0.9,
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
  }, [pathname]);

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
