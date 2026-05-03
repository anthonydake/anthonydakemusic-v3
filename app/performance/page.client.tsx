"use client";

import "../placements/projects-index.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { performanceIndex, type PerformanceItem } from "@/data/performance.data";
import SiteHeader from "@/app/components/SiteHeader";
import { useTransition } from "@/app/components/TransitionProvider";

export default function PerformanceIndexClient() {
  const { triggerTransition, isTransitioning, isMobileFallback } = useTransition();
  // Already sorted newest-first in the data file
  const items = performanceIndex;

  const [revealCount, setRevealCount] = useState(0);
  const rowsRef = useRef<HTMLDivElement | null>(null);
  const accumRef = useRef(0);
  const triggeredRef = useRef(false);
  const lastWheelRef = useRef<number | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let interval: number | null = null;
    const t = window.setTimeout(() => {
      if (reduced) { setRevealCount(items.length); return; }
      let count = 1;
      setRevealCount(1);
      interval = window.setInterval(() => {
        count += 1;
        setRevealCount(count);
        if (count >= items.length && interval) window.clearInterval(interval);
      }, 125);
    }, 0);
    return () => { window.clearTimeout(t); if (interval) window.clearInterval(interval); };
  }, [items.length]);

  useEffect(() => {
    const { style } = document.body;
    const prev = style.overflow;
    style.overflow = "hidden";
    return () => { style.overflow = prev; };
  }, []);

  // Scroll-to-home transition
  useEffect(() => {
    if (isTransitioning) return;
    const rows = rowsRef.current;
    if (!rows) return;
    const handleWheel = (e: WheelEvent) => {
      if (triggeredRef.current) return;
      e.preventDefault();
      const now = performance.now();
      const delta = e.deltaY;
      rows.scrollTop += delta * 0.35;
      if (Math.abs(delta) < 35) return;
      if (delta <= 0) { accumRef.current = 0; lastWheelRef.current = null; return; }
      const atBottom = rows.scrollTop + rows.clientHeight >= rows.scrollHeight - 2;
      if (!atBottom) { accumRef.current = 0; lastWheelRef.current = null; return; }
      if (lastWheelRef.current === null || now - lastWheelRef.current > 220) accumRef.current = 0;
      lastWheelRef.current = now;
      accumRef.current += delta;
      if (accumRef.current >= 140) {
        triggeredRef.current = true;
        rows.removeEventListener("wheel", handleWheel);
        triggerTransition("/");
      }
    };
    rows.addEventListener("wheel", handleWheel, { passive: false });
    return () => rows.removeEventListener("wheel", handleWheel);
  }, [isTransitioning, triggerTransition]);

  useEffect(() => { const rows = rowsRef.current; if (rows) rows.scrollTop = 0; }, []);

  return (
    <div className="performance-index-frame relative bg-black text-white h-screen overflow-hidden">
      <SiteHeader />
      <main className="relative z-[10] mx-auto max-w-[1600px] px-6 pb-24 pt-[120px] sm:pt-[200px] sm:px-8 lg:px-10 xl:px-12 2xl:px-16 h-[calc(100svh-56px)] overflow-hidden">
        <section
          aria-label="Performance index"
          ref={rowsRef}
          className="rows-scroll h-full min-h-0 overflow-y-auto overscroll-contain pr-2"
        >
          <YearGroups items={items} revealCount={revealCount} />
        </section>
      </main>

      {!isMobileFallback && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[12px] z-[20] flex justify-center">
          <span className="home-scroll-indicator text-[11.6875px] lowercase tracking-[0.28em] text-white" style={{ opacity: 0.35 }}>
            (scroll)
          </span>
        </div>
      )}
      <style jsx global>{`
        @keyframes homeScrollPulse { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
        .home-scroll-indicator { animation: homeScrollPulse 2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .home-scroll-indicator { animation: none; } }
        .rows-scroll { scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; }
        .rows-scroll::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>
    </div>
  );
}

function YearGroups({ items, revealCount }: { items: PerformanceItem[]; revealCount: number }) {
  const years = Array.from(new Set(items.map((p) => p.year))).sort((a, b) => b - a);

  // Build a flat index so reveal count works across year groups
  const indexById = new Map<string, number>();
  items.forEach((p, i) => indexById.set(p.id, i));

  return (
    <div className="space-y-5">
      {years.map((year) => {
        const yearItems = items.filter((p) => p.year === year);
        const yearVisible = yearItems.filter((p) => (indexById.get(p.id) ?? Infinity) < revealCount);
        if (yearVisible.length === 0) return null;

        return (
          <div key={year} className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10" />
              <div className="text-[12px] lg:text-[10.625px] uppercase tracking-[0.28em] text-white/50"><span>{year}</span></div>
            </div>
            <div className="space-y-0">
              {yearVisible.map((p) => {
                const venueLocation = `${p.venue}, ${p.city}, ${p.state}`;
                const Row = (
                  <>
                    {/* Mobile: 2-col */}
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-0.5 leading-tight lg:hidden">
                      <div className="text-[12px] lg:text-[9.5625px] uppercase tracking-[0.2em]"><span>{p.primaryArtist}</span></div>
                      <div className="text-[12px] lg:text-[9.5625px] uppercase tracking-[0.2em] text-white/50 text-right"><span>{p.year}</span></div>
                      <div className="text-[12px] lg:text-[9.5625px] uppercase tracking-[0.2em] text-white/55 col-span-2"><span>{p.venue}</span></div>
                    </div>
                    {/* Desktop: 3-col */}
                    <div className="hidden lg:grid lg:grid-cols-3 lg:items-start lg:gap-x-8 leading-tight">
                      <div className="text-[12px] lg:text-[9.5625px] uppercase tracking-[0.2em]"><span>{p.primaryArtist}</span></div>
                      <div className="text-[12px] lg:text-[9.5625px] uppercase tracking-[0.2em]">{venueLocation}</div>
                      <div className="text-[12px] lg:text-[9.5625px] uppercase tracking-[0.2em] text-white/50 text-right"><span>{p.year}</span></div>
                    </div>
                  </>
                );

                if (p.youtubeUrl) {
                  return (
                    <a
                      key={p.id}
                      href={p.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="projects-row projects-row-enter group block py-2 lg:py-2 hover:opacity-70 transition-opacity"
                    >
                      {Row}
                    </a>
                  );
                }

                return (
                  <div key={p.id} className="projects-row projects-row-enter py-2 lg:py-2">
                    {Row}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
