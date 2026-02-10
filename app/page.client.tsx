"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import HomeClient from "./components/HomeClient";
import ColumbusTime from "./components/ColumbusTime";
import site from "@/content/site";
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
  const projectsHref = q ? `/projects?${q}` : "/projects";
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
      const now = performance.now();
      const delta = e.deltaY;
      const minDelta = 35;
      const triggerThreshold = 140;
      const windowMs = 200;
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
        <div className="mx-auto grid h-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 text-[11px] uppercase tracking-[0.28em] text-black/65">
          <div className="justify-self-start">
            <span>Columbus, (OH)</span>
            <span className="mx-2 inline-block align-middle text-[14px] font-semibold leading-none">•</span>
            <ColumbusTime />
          </div>
          <Link
            href={homeHref}
            className="group inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 48 48"
              className="h-4 w-4 text-[#F2F2F2] transition group-hover:scale-[1.03]"
            >
              <line x1="8" y1="24" x2="40" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            </svg>
          </Link>
          <nav className="flex items-center justify-self-end gap-6">
            <Link className="hover:text-black" href={projectsHref}>
              Projects
            </Link>
            <Link className="hover:text-black" href={site.hero.cta.href}>
              {site.hero.cta.label}
            </Link>
            <Link className="hover:text-black" href="/about">
              About
            </Link>
          </nav>
        </div>
      </div>
      <div className="pt-14">
        <HomeClient />
      </div>
      <div className="pointer-events-none fixed inset-x-0 bottom-[12px] z-[20] flex justify-center">
        <span
          className="home-scroll-indicator text-[11px] lowercase tracking-[0.28em] text-black"
          style={{ opacity: 0.35 }}
        >
          (scroll)
        </span>
      </div>
      <style jsx global>{`
        @keyframes homeScrollPulse {
          0% {
            opacity: 0.35;
          }
          50% {
            opacity: 0.9;
          }
          100% {
            opacity: 0.35;
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
