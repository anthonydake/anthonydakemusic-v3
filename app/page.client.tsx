"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import HomeClient from "./components/HomeClient";
import NashvilleTime from "./components/NashvilleTime";
import HomeMark from "./components/HomeMark";
import { useTransition } from "./components/TransitionProvider";

export default function HomePageClient() {
  return (
    <Suspense fallback={null}>
      <HomeInner />
    </Suspense>
  );
}

function HomeInner() {
  const { triggerTransition, isTransitioning, isMobileFallback } = useTransition();
  const searchParams = useSearchParams();
  const q = searchParams.toString();
  const homeHref = q ? `/?${q}` : "/";
  const projectsHref = q ? `/placements?${q}` : "/placements";
  const accumRef = useRef(0);
  const triggeredRef = useRef(false);
  const readyRef = useRef(false);
  const lastWheelRef = useRef<number | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      readyRef.current = true;
    }, 800);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isMobileFallback) return;
    if (isTransitioning) return;

    const handleWheel = (e: WheelEvent) => {
      if (window.scrollY !== 0) return;
      if (!readyRef.current) return;
      if (triggeredRef.current) return;
      e.preventDefault();
      const now = performance.now();
      const delta = e.deltaY;
      const minDelta = 35;
      const triggerThreshold = 140;
      const windowMs = 220;
      if (Math.abs(delta) < minDelta) return;
      if (delta <= 0) {
        accumRef.current = 0;
        lastWheelRef.current = null;
        return;
      }
      if (lastWheelRef.current === null || now - lastWheelRef.current > windowMs) {
        accumRef.current = 0;
      }
      lastWheelRef.current = now;
      e.preventDefault();
      accumRef.current += delta;
      if (accumRef.current >= triggerThreshold) {
        triggeredRef.current = true;
        window.removeEventListener("wheel", handleWheel);
        triggerTransition(projectsHref);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isMobileFallback, isTransitioning, triggerTransition, projectsHref]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[9999] isolate h-14 bg-white/70 backdrop-blur">
        <div className="mx-auto grid h-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 text-[11.6875px] uppercase tracking-[0.28em] text-black/65">
          <div className="justify-self-start">
            <Link className="md:hidden hover:text-black" href="/performance">
              Performance
            </Link>
            <div className="hidden items-center md:flex">
              <span>Nashville, (TN)</span>
              <span className="mx-2 inline-block align-middle text-[14.875px] font-semibold leading-none">•</span>
              <NashvilleTime />
            </div>
          </div>
          <Link
            href={homeHref}
            className="group inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <HomeMark />
          </Link>
          <div className="justify-self-end">
            <div className="flex items-center gap-4 md:hidden">
              <Link className="hover:text-black" href="/performance">
                Performance
              </Link>
              
            </div>
            <nav className="hidden items-center gap-6 md:flex">
              <Link className="hover:text-black" href={projectsHref}>
                Performance
              </Link>
              <Link className="hover:text-black" href="/performance">
                Performance
              </Link>
              <Link className="hover:text-black" href="/about">
                About
              </Link>
              
            </nav>
          </div>
        </div>
      </div>
      <div className="pt-14">
        <HomeClient nextHref={projectsHref} />
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-[12px] z-[20] flex justify-center">
        <span
          className="home-scroll-indicator text-[11.6875px] lowercase tracking-[0.28em] text-black"
          style={{ opacity: 0.35 }}
        >
          (scroll)
        </span>
      </div>
      <style jsx global>{`
        @keyframes homeScrollPulse {
          0% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        .home-scroll-indicator {
          animation: homeScrollPulse 2s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .home-scroll-indicator {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
