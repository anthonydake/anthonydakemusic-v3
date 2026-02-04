"use client";

import "./projects-index.css";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { projectIndex, type ProjectIndexItem, type ProjectPreview } from "@/data/projects.data";

type MediaQueryListLegacy = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

type ReverseGeocodeResult = {
  city?: string;
  locality?: string;
  principalSubdivisionCode?: string;
  countryCode?: string;
};

function formatLocalTime(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return fmt.format(d);
}

function parseSortKeyMMDDYYYY(date: string) {
  // "MM/DD/YYYY" -> YYYYMMDD (number)
  const m = Number(date.slice(0, 2));
  const d = Number(date.slice(3, 5));
  const y = Number(date.slice(6, 10));
  if (!Number.isFinite(m) || !Number.isFinite(d) || !Number.isFinite(y)) return 0;
  return y * 10000 + m * 100 + d;
}

function formatLocationLabel(city: string | null, stateCode: string | null) {
  if (!city || !stateCode) return "LOCATION UNAVAILABLE";
  return `${city.toUpperCase()}, (${stateCode.toUpperCase()})`;
}

function extractStateCode(result: ReverseGeocodeResult) {
  // BigDataCloud returns e.g. "US-OH"
  const code = result.principalSubdivisionCode || "";
  const parts = code.split("-");
  const tail = parts[parts.length - 1];
  return tail && tail.length <= 3 ? tail : null;
}

function pickCity(result: ReverseGeocodeResult) {
  return result.city || result.locality || null;
}

function samePreview(a: ProjectPreview | null, b: ProjectPreview | null) {
  if (!a || !b) return false;
  if (a.type !== b.type) return false;
  if (a.src !== b.src) return false;
  if (a.type === "video" && b.type === "video") return a.poster === b.poster;
  return true;
}

export default function ProjectsPage() {
  const items = useMemo(() => {
    return [...projectIndex].sort((a, b) => parseSortKeyMMDDYYYY(b.date) - parseSortKeyMMDDYYYY(a.date));
  }, []);

  const [hoverCapable, setHoverCapable] = useState(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  });
  const [now, setNow] = useState<Date>(() => new Date());
  const [locationLabel, setLocationLabel] = useState(() => {
    if (typeof window === "undefined") return "LOCATION UNAVAILABLE";
    return window.localStorage.getItem("ad_location_label_v1") ?? "LOCATION UNAVAILABLE";
  });

  const [previewCurrent, setPreviewCurrent] = useState<ProjectPreview | null>(() => items.find((p) => p.preview)?.preview ?? null);
  const [previewNext, setPreviewNext] = useState<ProjectPreview | null>(null);
  const [previewNextVisible, setPreviewNextVisible] = useState(false);
  const previewCommitRef = useRef<number | null>(null);

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
    // Update on minute boundaries (and then every minute).
    let interval: number | null = null;
    const update = () => setNow(new Date());

    const msToNextMinute = 60000 - (Date.now() % 60000);
    const t = window.setTimeout(() => {
      update();
      interval = window.setInterval(update, 60000);
    }, msToNextMinute);

    return () => {
      window.clearTimeout(t);
      if (interval) window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const CACHE_KEY = "ad_location_label_v1";
    if (window.localStorage.getItem(CACHE_KEY)) return;

    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // Lightweight reverse geocode (no API key). If this fails, fall back silently.
          const url =
            "https://api.bigdatacloud.net/data/reverse-geocode-client" +
            `?latitude=${encodeURIComponent(latitude)}` +
            `&longitude=${encodeURIComponent(longitude)}` +
            `&localityLanguage=en`;
          const res = await fetch(url, { method: "GET" });
          if (!res.ok) return;
          const data = (await res.json()) as ReverseGeocodeResult;

          const city = pickCity(data);
          const state = extractStateCode(data) || (data.countryCode ? data.countryCode : null);
          const label = formatLocationLabel(city, state);
          setLocationLabel(label);
          window.localStorage.setItem(CACHE_KEY, label);
        } catch {
          // Ignore — keep placeholder.
        }
      },
      () => {
        // Denied/failed — keep placeholder.
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    return () => {
      if (previewCommitRef.current) window.clearTimeout(previewCommitRef.current);
    };
  }, []);

  const timeLabel = useMemo(() => formatLocalTime(now), [now]);

  // Desktop/table column sizing (used by row grid + background hairlines).
  const frameStyle = useMemo(() => {
    return {
      // Tuned to match the reference "index table" proportions without introducing new fonts.
      ["--col1"]: "clamp(180px, 22vw, 240px)",
      ["--col2"]: "clamp(220px, 30vw, 380px)",
      ["--preview"]: "clamp(360px, 34vw, 520px)",
    } as React.CSSProperties;
  }, []);

  const queuePreview = (next: ProjectPreview | null) => {
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
    <div className="relative min-h-screen bg-[#f3f0e8] text-black">
      {/* Vertical hairline gridlines (desktop only) */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="mx-auto h-full max-w-6xl px-6">
          <div className="relative h-full" style={frameStyle}>
            <div className="absolute inset-y-0 left-[var(--col1)] w-px bg-black/10" />
            <div className="absolute inset-y-0 left-[calc(var(--col1)+var(--col2))] w-px bg-black/10" />
            {hoverCapable && (
              <div className="absolute inset-y-0 left-[calc(100%-var(--preview))] w-px bg-black/10" />
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="fixed inset-x-0 top-0 z-[50] bg-[#f3f0e8]">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-start px-6 pt-6 text-[11px] uppercase tracking-[0.28em] text-black/80">
          <div className="justify-self-start">
            <span>{locationLabel}</span>
            <span className="mx-2 inline-block align-middle text-[14px] font-semibold leading-none">•</span>
            <span suppressHydrationWarning>{timeLabel}</span>
          </div>

          <Link href="/" className="group flex flex-col items-center justify-center gap-3">
            <svg aria-hidden="true" viewBox="0 0 48 48" className="h-4 w-4 text-black transition group-hover:opacity-80">
              <line x1="8" y1="24" x2="40" y2="24" stroke="#000000" strokeWidth="2" strokeLinecap="square" />
            </svg>
            <span className="text-[12px] normal-case tracking-normal text-black/70">(Project Index)</span>
          </Link>

          <nav className="flex items-center justify-self-end gap-6">
            <Link className="hover:text-black" href="/projects">
              Projects
            </Link>
            <Link className="hover:text-black" href="/contact">
              Contact
            </Link>
            <Link className="hover:text-black" href="/about">
              About
            </Link>
          </nav>
        </div>

        <div className="mx-auto mt-4 h-px max-w-6xl bg-black/10" />
      </div>

      <main className="relative z-[10] mx-auto max-w-6xl px-6 pb-24 pt-40">
        <div
          className={[
            hoverCapable ? "grid gap-12 lg:grid-cols-[minmax(0,1fr)_var(--preview)]" : "grid gap-12",
          ].join(" ")}
          style={frameStyle}
        >
          <section aria-label="Project index">
            <YearGroups
              items={items}
              onRowHover={(id) => {
                if (!hoverCapable) return;
                const item = items.find((p) => p.id === id);
                queuePreview(item?.preview ?? null);
              }}
            />
          </section>

          {/* Desktop sticky preview (no preview on touch / hover:none) */}
          {hoverCapable && (
            <aside className="hidden lg:block" aria-label="Project preview">
              <div className="sticky top-40">
                <PreviewPanel current={previewCurrent} next={previewNext} nextVisible={previewNextVisible} onNextReady={onNextReady} />
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}

function YearGroups({ items, onRowHover }: { items: ProjectIndexItem[]; onRowHover: (id: string) => void }) {
  const years = Array.from(new Set(items.map((p) => p.year))).sort((a, b) => b - a);

  return (
    <div className="space-y-10">
      {years.map((year) => {
        const yearItems = items.filter((p) => p.year === year);
        return (
          <div key={year} className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-black/10" />
              <div className="text-[11px] uppercase tracking-[0.28em] text-black/50">{year}</div>
            </div>

            <div className="space-y-1">
              {yearItems.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.slug}`}
                  className="projects-row group block py-2.5 transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-black/60"
                  onMouseEnter={() => onRowHover(p.id)}
                >
                  <div className="flex flex-col gap-1 lg:grid lg:grid-cols-[var(--col1)_var(--col2)_minmax(0,1fr)] lg:items-baseline lg:gap-x-8">
                    {/* Line 1 (mobile): date + artist | Column 1 (desktop) */}
                    <div className="text-[12px] uppercase tracking-[0.22em] lg:text-[11px]">
                      <span className="tabular-nums">{p.date}</span>{" "}
                      <span className="projects-row-muted text-black/55">{p.artist}</span>
                    </div>

                    {/* Line 2 (mobile): title | Column 3 (desktop) */}
                    <div className="order-2 text-[13px] uppercase tracking-[0.22em] lg:order-none lg:col-start-3 lg:text-[11px]">
                      {p.title}
                    </div>

                    {/* Line 3 (mobile): work tags | Column 2 (desktop) */}
                    <div className="projects-row-muted projects-row-italic order-3 text-[12px] tracking-[0.18em] italic lg:order-none lg:col-start-2 lg:text-[11px] lg:not-italic">
                      {p.workTags.join(", ")}
                    </div>
                  </div>
                </Link>
              ))}
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
  current: ProjectPreview | null;
  next: ProjectPreview | null;
  nextVisible: boolean;
  onNextReady: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.10)]">
        <div className="relative aspect-[5/4]">
          {current ? <PreviewMedia preview={current} /> : <div className="absolute inset-0 bg-black/5" />}

          {next && (
            <div
              className={`absolute inset-0 transition-opacity duration-200 ${nextVisible ? "opacity-100" : "opacity-0"}`}
            >
              <PreviewMedia preview={next} onReady={onNextReady} />
            </div>
          )}
        </div>
      </div>

      <div className="text-[11px] uppercase tracking-[0.28em] text-black/55">Preview</div>
    </div>
  );
}

function PreviewMedia({ preview, onReady }: { preview: ProjectPreview; onReady?: () => void }) {
  if (preview.type === "video") {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={preview.src}
        poster={preview.poster}
        muted
        loop
        playsInline
        autoPlay
        onCanPlay={() => onReady?.()}
      />
    );
  }

  return (
    <Image
      src={preview.src}
      alt=""
      fill
      className="object-cover"
      sizes="(min-width: 1024px) 520px, 100vw"
      onLoadingComplete={() => onReady?.()}
    />
  );
}
