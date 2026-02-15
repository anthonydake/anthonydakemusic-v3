"use client";

import "../projects/projects-index.css";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { performanceIndex, type PerformanceItem } from "@/data/performance.data";
import ColumbusTime from "@/app/components/ColumbusTime";
import HomeMark from "@/app/components/HomeMark";

type MediaQueryListLegacy = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

type PerformancePreview = { type: "image"; src: string };

function parseSortKey(dateDisplay: string) {
  const parsed = Date.parse(dateDisplay);
  if (!Number.isNaN(parsed)) return parsed;
  const yearMatch = dateDisplay.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) return Number(yearMatch[0]) * 10000;
  return 0;
}

function extractYear(dateDisplay: string) {
  const yearMatch = dateDisplay.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? Number(yearMatch[0]) : 0;
}

function samePreview(a: PerformancePreview | null, b: PerformancePreview | null) {
  if (!a || !b) return false;
  return a.type === b.type && a.src === b.src;
}

function getPreview(item: PerformanceItem): PerformancePreview | null {
  const src = item.photoUrls?.[0];
  return src ? { type: "image", src } : null;
}

function formatLocationLine(item: PerformanceItem) {
  const parts: string[] = [];
  if (item.venue) parts.push(item.venue);
  const cityState = [item.city, item.state].filter(Boolean).join(", ");
  if (cityState) parts.push(cityState);
  return parts.join(" • ");
}

export default function PerformanceIndexClient() {
  const items = useMemo(() => {
    return [...performanceIndex].sort((a, b) => parseSortKey(b.dateDisplay) - parseSortKey(a.dateDisplay));
  }, []);

  const [revealCount, setRevealCount] = useState(0);
  const [hoverCapable, setHoverCapable] = useState(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  });
  const [previewCurrent, setPreviewCurrent] = useState<PerformancePreview | null>(() => {
    for (const item of items) {
      const preview = getPreview(item);
      if (preview) return preview;
    }
    return null;
  });
  const [previewNext, setPreviewNext] = useState<PerformancePreview | null>(null);
  const [previewNextVisible, setPreviewNextVisible] = useState(false);
  const previewCommitRef = useRef<number | null>(null);

  const revealIndexBySlug = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((p, idx) => map.set(p.slug, idx));
    return map;
  }, [items]);

  useEffect(() => {
    const query = "(hover: hover) and (pointer: fine)";
    const mq = window.matchMedia(query) as MediaQueryListLegacy;
    const update = () => setHoverCapable(mq.matches);
    mq.addEventListener?.("change", update);
    mq.addListener?.(update);
    return () => {
      mq.removeEventListener?.("change", update);
      mq.removeListener?.(update);
    };
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let interval: number | null = null;

    // Avoid setState directly in the effect body (lint rule); run from a callback.
    const t = window.setTimeout(() => {
      if (reduced) {
        setRevealCount(items.length);
        return;
      }

      // Reveal from top to bottom, one row every quarter second.
      let count = 1;
      setRevealCount(1);

      interval = window.setInterval(() => {
        count += 1;
        setRevealCount(count);
        if (count >= items.length && interval) window.clearInterval(interval);
      }, 250);
    }, 0);

    return () => {
      window.clearTimeout(t);
      if (interval) window.clearInterval(interval);
    };
  }, [items.length]);

  useEffect(() => {
    const { style } = document.body;
    const prev = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewCommitRef.current) window.clearTimeout(previewCommitRef.current);
    };
  }, []);

  // Desktop/table column sizing (used by row grid + background hairlines).
  const frameStyle = useMemo(() => {
    return {
      // Tuned to match the reference "index table" proportions without introducing new fonts.
      ["--col1"]: "clamp(220px, 18vw, 300px)",
      ["--col2"]: "clamp(260px, 28vw, 520px)",
      ["--preview"]: "clamp(390px, 27vw, 690px)",
      ["--preview-bleed"]: "calc((100vw - min(1600px, 100vw) + 2 * var(--page-pad)) / 2)",
    } as React.CSSProperties;
  }, []);

  const queuePreview = (next: PerformancePreview | null) => {
    if (!next) return;
    if (samePreview(previewCurrent, next)) return;
    if (previewCommitRef.current) window.clearTimeout(previewCommitRef.current);
    setPreviewNextVisible(false);
    setPreviewNext(next);
  };

  const onNextReady = () => {
    const commit = previewNext;
    if (!commit) return;
    setPreviewNextVisible(true);
    if (previewCommitRef.current) window.clearTimeout(previewCommitRef.current);
    previewCommitRef.current = window.setTimeout(() => {
      setPreviewCurrent(commit);
      setPreviewNext(null);
      setPreviewNextVisible(false);
    }, 220);
  };

  return (
    <div className="relative h-screen overflow-hidden bg-white text-black">
      {/* Vertical hairline gridlines (desktop only) */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="mx-auto h-full max-w-[1600px] px-6 sm:px-8 lg:px-10 xl:px-12">
          <div className="relative h-full" style={frameStyle}>
            <div className="absolute inset-y-0 left-[var(--col1)] w-px bg-black/10" />
            <div className="absolute inset-y-0 left-[calc(var(--col1)+var(--col2))] w-px bg-black/10" />
            {hoverCapable && <div className="absolute inset-y-0 left-[calc(100%-var(--preview))] w-px bg-black/10" />}
          </div>
        </div>
      </div>

      {/* Header (match home spacing) */}
      <div className="fixed inset-x-0 top-0 z-[9999] isolate h-14 bg-white/70 backdrop-blur">
        <div className="mx-auto grid h-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 text-[11px] uppercase tracking-[0.28em] text-black/65">
          <div className="justify-self-start">
            <span>Columbus, (OH)</span>
            <span className="mx-2 inline-block align-middle text-[14px] font-semibold leading-none">•</span>
            <ColumbusTime />
          </div>

          <Link
            href="/"
            className="group inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <HomeMark className="h-[18px] w-[18px] transition group-hover:scale-[1.04] group-hover:brightness-110" />
          </Link>

          <nav className="flex items-center justify-self-end gap-6">
            <Link className="hover:text-black" href="/projects">
              Projects
            </Link>
            <Link className="hover:text-black" href="/performance">
              Performance
            </Link>
          </nav>
        </div>
      </div>

      <main className="relative z-[10] mx-auto h-[calc(100svh-56px)] max-w-[1600px] overflow-hidden px-6 pb-24 pt-[246px] [--page-pad:1.5rem] sm:px-8 sm:[--page-pad:2rem] lg:px-10 lg:[--page-pad:2.5rem] xl:px-12 xl:[--page-pad:3rem]">
        <div
          className={[
            hoverCapable ? "grid gap-10 lg:grid-cols-[minmax(0,1fr)_var(--preview)] lg:gap-0" : "grid gap-10",
          ].join(" ")}
          style={frameStyle}
        >
          <section aria-label="Performance index">
            <YearGroups
              items={items}
              revealCount={revealCount}
              revealIndexBySlug={revealIndexBySlug}
              onRowHover={(slug) => {
                if (!hoverCapable) return;
                const item = items.find((p) => p.slug === slug);
                queuePreview(item ? getPreview(item) : null);
              }}
            />
          </section>

          {/* Desktop sticky preview (no preview on touch / hover:none) */}
          {hoverCapable && previewCurrent && (
            <aside
              className="hidden lg:flex lg:items-center lg:justify-end lg:mr-[calc(-1*var(--preview-bleed))]"
              aria-label="Performance preview"
            >
              <div className="flex min-h-screen w-full items-center justify-end pr-0 -mt-[200px]">
                <div className="w-full">
                  <PreviewPanel
                    current={previewCurrent}
                    next={previewNext}
                    nextVisible={previewNextVisible}
                    onNextReady={onNextReady}
                  />
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}

function YearGroups({
  items,
  revealCount,
  revealIndexBySlug,
  onRowHover,
}: {
  items: PerformanceItem[];
  revealCount: number;
  revealIndexBySlug: Map<string, number>;
  onRowHover: (slug: string) => void;
}) {
  const years = Array.from(new Set(items.map((p) => extractYear(p.dateDisplay)).filter((y) => y > 0))).sort(
    (a, b) => b - a
  );

  return (
    <div className="space-y-5">
      {years.map((year) => {
        const yearItems = items.filter((p) => extractYear(p.dateDisplay) === year);
        const yearVisible = yearItems.filter((p) => (revealIndexBySlug.get(p.slug) ?? Number.POSITIVE_INFINITY) < revealCount);
        if (yearVisible.length === 0) return null;

        return (
          <div key={year} className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-black/10" />
              <div className="text-[10px] uppercase tracking-[0.28em] text-black/50">{year}</div>
            </div>

            <div className="space-y-0.5">
              {yearVisible.map((p) => {
                const locationLine = formatLocationLine(p);
                const rolesLine = p.roles.join(" / ");
                return (
                  <Link
                    key={p.slug}
                    href={`/performance/${p.slug}`}
                    className="projects-row projects-row-enter group block py-2 transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-black/60 lg:h-6 lg:py-0 lg:pr-10"
                    onMouseEnter={() => onRowHover(p.slug)}
                  >
                    <div className="min-w-0 flex flex-col gap-1 leading-tight lg:grid lg:h-full lg:grid-cols-[var(--col1)_var(--col2)_minmax(0,1fr)] lg:items-center lg:gap-x-8">
                      {/* Line 1 (mobile): date + artist | Column 1 (desktop) */}
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <div className="flex min-w-0 items-baseline gap-2 text-[9px] uppercase tracking-[0.22em]">
                          <span className="tabular-nums shrink-0">{p.dateDisplay}</span>
                          <span className="projects-row-muted truncate text-black/55">{p.primaryArtist}</span>
                        </div>
                        {locationLine ? (
                          <div className="projects-row-muted truncate text-[8px] uppercase tracking-[0.22em] text-black/45">
                            {locationLine}
                          </div>
                        ) : null}
                      </div>

                      {/* Line 2 (mobile): title | Column 3 (desktop) */}
                      <div className="order-2 truncate text-[9px] uppercase tracking-[0.22em] lg:order-none lg:col-start-3 lg:text-right">
                        <span className="truncate">{p.title}</span>
                        {p.heroVideoUrl ? (
                          <span className="ml-2 text-[8px] uppercase tracking-[0.24em] text-black/50">Video</span>
                        ) : null}
                      </div>

                      {/* Line 3 (mobile): roles | Column 2 (desktop) */}
                      <div className="projects-row-muted projects-row-italic order-3 truncate text-[9px] tracking-[0.22em] italic lg:order-none lg:col-start-2 lg:text-center lg:not-italic">
                        <span className="truncate">{rolesLine}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PreviewPanel({
  current,
  next,
  nextVisible,
  onNextReady,
}: {
  current: PerformancePreview;
  next: PerformancePreview | null;
  nextVisible: boolean;
  onNextReady: () => void;
}) {
  return (
    <div className="w-full">
      {/* Cinematic Frame */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <PreviewMedia preview={current} />

        {next && (
          <div
            className={`absolute inset-0 transition-opacity duration-400 ${
              nextVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <PreviewMedia preview={next} onReady={onNextReady} />
          </div>
        )}
      </div>

      {/* Subtle Caption */}
      {/* Preview caption removed */}
    </div>
  );
}

function PreviewMedia({ preview, onReady }: { preview: PerformancePreview; onReady?: () => void }) {
  return (
    <img
      className="h-full w-full object-cover"
      src={preview.src}
      alt="Performance preview"
      onLoad={() => onReady?.()}
    />
  );
}
