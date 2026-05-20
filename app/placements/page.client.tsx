"use client";

import "./projects-index.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { projectIndex, type ProjectIndexItem } from "@/data/projects.data";
import SiteHeader from "@/app/components/SiteHeader";
import JsonLd from "@/app/components/JsonLd";
import { useTransition } from "@/app/components/TransitionProvider";

const SITE_URL = "https://www.anthonydakemusic.com";

function placementsSchema(items: ProjectIndexItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Anthony Dake — Placements",
    description:
      "Curated drum credits across released records — drum performance and drum programming for independent artists.",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "MusicRecording",
        name: p.title,
        byArtist: { "@type": "MusicGroup", name: p.artist },
        datePublished: String(p.year),
        contributor: {
          "@type": "Person",
          name: "Anthony Dake",
          roleName: p.role,
        },
        ...(p.youtubeUrl ? { sameAs: p.youtubeUrl, url: p.youtubeUrl } : {}),
      },
    })),
  };
}

function breadcrumbsSchema(label: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
      { "@type": "ListItem", position: 2, name: label, item: SITE_URL + path },
    ],
  };
}

export default function ProjectsIndexClient() {
  const { triggerTransition, isTransitioning, isMobileFallback } = useTransition();
  // Already sorted newest-first in the data file
  const items = projectIndex;

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

  // Scroll-to-performance transition
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
        triggerTransition("/performance");
      }
    };
    rows.addEventListener("wheel", handleWheel, { passive: false });
    return () => rows.removeEventListener("wheel", handleWheel);
  }, [isTransitioning, triggerTransition]);

  useEffect(() => { const rows = rowsRef.current; if (rows) rows.scrollTop = 0; }, []);

  return (
    <div className="projects-index-frame relative bg-black text-white h-screen overflow-hidden">
      <JsonLd data={placementsSchema(items)} />
      <JsonLd data={breadcrumbsSchema("Placements", "/placements")} />
      <SiteHeader />
      <main id="main-content" className="relative z-[10] mx-auto flex max-w-[1600px] flex-col px-6 pb-4 pt-20 sm:pt-24 sm:px-8 lg:px-10 xl:px-12 2xl:px-16 h-[calc(100svh-56px)] overflow-hidden">
        <div className="mb-6 flex flex-shrink-0 items-baseline justify-between gap-4">
          <span className="text-[11px] uppercase tracking-[0.28em] opacity-50">
            (IDX·01)
          </span>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-[18px] uppercase tracking-[0.2em] font-light sm:text-[22px]">
              placements
            </h1>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              recent highlights
            </p>
          </div>
          <span className="text-[10px] uppercase tracking-[0.22em] opacity-30">
            index of {items.length}
          </span>
        </div>
        <section
          aria-label="Placements index"
          ref={rowsRef}
          className="rows-scroll flex-1 min-h-0 overflow-y-auto overscroll-contain pr-2"
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

function YearGroups({ items, revealCount }: { items: ProjectIndexItem[]; revealCount: number }) {
  const years = Array.from(new Set(items.map((p) => p.year))).sort((a, b) => b - a);

  // Build a flat index so reveal count works across year groups
  const indexById = new Map<string, number>();
  items.forEach((p, i) => indexById.set(p.id, i));

  return (
    <div className="space-y-6">
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
                const Row = (
                  <>
                    {/* Mobile: 2-col */}
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-0.5 leading-tight lg:hidden">
                      <div className="text-[12px] lg:text-[9.5625px] uppercase tracking-[0.2em]"><span>{p.artist}</span></div>
                      <div className="text-[12px] lg:text-[9.5625px] uppercase tracking-[0.2em] text-white/50 text-right"><time dateTime={String(p.year)}>{p.year}</time></div>
                      <div className="text-[12px] lg:text-[9.5625px] uppercase tracking-[0.2em] text-white/55 col-span-2"><span>{p.title}</span></div>
                      {p.tags && p.tags.length > 0 && (
                        <div className="text-[10px] uppercase tracking-[0.18em] opacity-30 col-span-2 mt-0.5">
                          <span>{p.tags.join(", ")}</span>
                        </div>
                      )}
                    </div>
                    {/* Desktop: 4-col */}
                    <div className="hidden lg:grid lg:grid-cols-4 lg:items-start lg:gap-x-8 leading-tight">
                      <div className="text-[12px] lg:text-[9.5625px] uppercase tracking-[0.2em]"><span>{p.artist}</span></div>
                      <div className="text-[12px] lg:text-[9.5625px] uppercase tracking-[0.2em]"><span>{p.title}</span></div>
                      <div className="text-[12px] lg:text-[9.5625px] uppercase tracking-[0.2em] text-white/55"><span>{p.role}</span></div>
                      <div className="text-[12px] lg:text-[9.5625px] uppercase tracking-[0.2em] text-white/50 text-right"><time dateTime={String(p.year)}>{p.year}</time></div>
                      {p.tags && p.tags.length > 0 && (
                        <div className="text-[8.5px] uppercase tracking-[0.18em] opacity-30 col-span-4 mt-0.5">
                          <span>{p.tags.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  </>
                );

                if (p.youtubeUrl) {
                  return (
                    <a
                      key={p.id}
                      href={p.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="projects-row projects-row-enter py-2.5 lg:py-3 block transition-opacity hover:opacity-70"
                    >
                      {Row}
                    </a>
                  );
                }

                return (
                  <div key={p.id} className="projects-row projects-row-enter py-2.5 lg:py-3">
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
