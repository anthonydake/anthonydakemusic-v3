"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import TextScramble from "./components/TextScramble";
import LogoArchitectOfSound from "./components/LogoArchitectOfSound";
import site from "@/content/site";
import { useTransition } from "./components/TransitionProvider";

function formatColumbusTime(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return fmt.format(d);
}

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
  const [now, setNow] = useState<Date>(() => new Date());
  const [showLiveTime, setShowLiveTime] = useState(false);
  const [initialTime] = useState(() => formatColumbusTime(new Date()));
  const accumRef = useRef(0);
  const triggeredRef = useRef(false);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setShowLiveTime(true), 650);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (isMobileFallback) return;
    if (isTransitioning) return;

    const handleWheel = (e: WheelEvent) => {
      if (triggeredRef.current) return;
      const delta = e.deltaY;
      if (Math.abs(delta) < 6) return;
      if (delta <= 0) {
        accumRef.current = Math.max(0, accumRef.current + delta);
        return;
      }
      e.preventDefault();
      accumRef.current += delta;
      if (accumRef.current > 150) {
        triggeredRef.current = true;
        window.removeEventListener("wheel", handleWheel);
        triggerTransition(projectsHref);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isMobileFallback, isTransitioning, triggerTransition, projectsHref]);

  const timeLabel = useMemo(() => formatColumbusTime(now), [now]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[9999] isolate h-14 bg-white/70 backdrop-blur">
        <div className="mx-auto grid h-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 text-[11px] uppercase tracking-[0.28em] text-black/65">
          <div className="justify-self-start">
            <span>Columbus, (OH)</span>
            <span className="mx-2 inline-block align-middle text-[14px] font-semibold leading-none">•</span>
            <span>
              {showLiveTime ? (
                timeLabel
              ) : (
                <TextScramble
                  text={initialTime}
                  duration={500}
                  charset="#%&$@+|"
                  scrambleFraction={0.35}
                  leftToRight
                />
              )}
            </span>
          </div>
          <Link
            href={homeHref}
            className="group inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 48 48"
              className="h-4 w-4 text-black transition group-hover:scale-[1.03]"
            >
              <line x1="8" y1="24" x2="40" y2="24" stroke="#000000" strokeWidth="2" strokeLinecap="square" />
            </svg>
          </Link>
          <nav className="flex items-center justify-self-end gap-6">
            <Link
              className="hover:text-black"
              href={projectsHref}
              onClick={(e) => {
                e.preventDefault();
                triggerTransition(projectsHref);
              }}
            >
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

      <section className="relative flex h-screen items-center justify-center overflow-hidden pt-14 box-border">
        <div className="select-none">
          <LogoArchitectOfSound />
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-6 z-[20] flex justify-center">
        <span className="text-[11px] lowercase tracking-[0.32em] text-black/70 animate-scrollPulse">scroll</span>
      </div>
    </>
  );
}
