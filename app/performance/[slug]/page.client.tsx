"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ColumbusTime from "@/app/components/ColumbusTime";
import HomeMark from "@/app/components/HomeMark";
import { performanceIndex, type PerformanceItem } from "@/data/performance.data";

const contactHref = "mailto:adakemusic@gmail.com";

function formatLocation(item: PerformanceItem) {
  const parts: string[] = [];
  if (item.venue) parts.push(item.venue);
  const cityState = [item.city, item.state].filter(Boolean).join(", ");
  if (cityState) parts.push(cityState);
  return parts.join(" • ");
}

function getYouTubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }
    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v");
    }
    if (parsed.pathname.includes("/embed/")) {
      return parsed.pathname.split("/embed/")[1]?.split("/")[0] || null;
    }
  } catch {
    return null;
  }
  return null;
}

function getVimeoId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("vimeo.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      return parts[parts.length - 1] || null;
    }
  } catch {
    return null;
  }
  return null;
}

function parseStartSeconds(value: string) {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  if (/^\d+s$/.test(trimmed)) return Number(trimmed.replace("s", ""));
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":").map((part) => Number(part));
    if (parts.some((n) => Number.isNaN(n))) return null;
    return parts.reduce((acc, n) => acc * 60 + n, 0);
  }
  const match = trimmed.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i);
  if (!match) return null;
  const hours = match[1] ? Number(match[1]) : 0;
  const minutes = match[2] ? Number(match[2]) : 0;
  const seconds = match[3] ? Number(match[3]) : 0;
  const total = hours * 3600 + minutes * 60 + seconds;
  return Number.isNaN(total) || total === 0 ? null : total;
}

function getStartSeconds(url: string) {
  try {
    const parsed = new URL(url);
    const start = parsed.searchParams.get("start") ?? parsed.searchParams.get("t");
    if (!start) return null;
    return parseStartSeconds(start);
  } catch {
    return null;
  }
}

function getEmbedUrl(url: string) {
  const youtubeId = getYouTubeId(url);
  if (youtubeId) {
    const startSeconds = getStartSeconds(url);
    return startSeconds ? `https://www.youtube.com/embed/${youtubeId}?start=${startSeconds}` : `https://www.youtube.com/embed/${youtubeId}`;
  }
  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    const startSeconds = getStartSeconds(url);
    return startSeconds ? `https://player.vimeo.com/video/${vimeoId}#t=${startSeconds}s` : `https://player.vimeo.com/video/${vimeoId}`;
  }
  return url;
}

export default function PerformanceDetailClient() {
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [mapHref, setMapHref] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromPath = window.location.pathname.split("/").filter(Boolean).pop() || null;
    setCurrentSlug(fromPath);
  }, []);

  const performance = useMemo(() => {
    return performanceIndex.find((p) => p.slug === currentSlug) || null;
  }, [currentSlug]);

  const currentIndex = currentSlug ? performanceIndex.findIndex((p) => p.slug === currentSlug) : -1;
  const prevPerformance = currentIndex > 0 ? performanceIndex[currentIndex - 1] : null;
  const nextPerformance =
    currentIndex >= 0 && currentIndex < performanceIndex.length - 1 ? performanceIndex[currentIndex + 1] : null;

  if (!performance) {
    return (
      <div className="relative min-h-screen bg-white text-black">
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

        <main className="relative z-[10] mx-auto max-w-5xl px-6 pb-24 pt-24 text-center sm:px-8 lg:px-10 xl:px-12">
          <div className="space-y-6">
            <div className="text-[10px] uppercase tracking-[0.28em] text-black/45">Performance</div>
            <h1 className="text-balance text-[clamp(24px,3.4vw,46px)] font-medium uppercase tracking-[0.02em] text-black">
              Performance Unavailable
            </h1>
            <p className="text-sm text-black/60">This performance detail isn&apos;t live yet.</p>
            <Link
              href={contactHref}
              className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-[11px] uppercase tracking-[0.28em] text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Book / Contact
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const locationLine = formatLocation(performance);
  const photosAll = (performance.photoUrls ?? []).filter(Boolean);
  const detailPhotos = photosAll.length > 1 ? photosAll.slice(1, 3) : photosAll;
  const embedUrl = performance.heroVideoUrl ? getEmbedUrl(performance.heroVideoUrl) : null;
  const cityState = [performance.city, performance.state].filter(Boolean).join(", ");

  const venue = performance?.venue;
  const city = performance?.city;
  const state = performance?.state;

  useEffect(() => {
    if (!performance) {
      setMapHref(null);
      return;
    }
    const query = [venue, city, state].filter(Boolean).join(", ");
    if (!query) {
      setMapHref(null);
      return;
    }
    const encoded = encodeURIComponent(query);
    const apple = `https://maps.apple.com/?q=${encoded}`;
    const google = `https://www.google.com/maps/search/?api=1&query=${encoded}`;
    const isApple = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
    setMapHref(isApple ? apple : google);
  }, [performance, venue, city, state]);

  return (
    <div className="relative min-h-screen bg-white text-black">
      {/* Header (match home) */}
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

      <main className="relative z-[10] mx-auto h-[calc(100svh-56px)] max-w-6xl overflow-hidden px-6 pb-8 pt-16 sm:px-8 lg:px-10 xl:px-12">
        <div className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto] gap-6 lg:gap-8">
          <section aria-label="Show hero" className="w-full border-y border-black/10 bg-white px-6 py-5 text-center sm:py-6">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-2">
              <div className="text-[9px] uppercase tracking-[0.28em] text-black/50">{performance.dateDisplay}</div>
              <h1 className="text-balance text-[clamp(16px,2.6vw,28px)] font-medium uppercase leading-[1.05] tracking-[0.02em] text-black">
                {performance.title}
              </h1>
              <div className="text-[clamp(10px,1.4vw,14px)] uppercase tracking-[0.18em] text-black/70">
                {performance.primaryArtist}
              </div>
              {performance.venue ? (
                <div className="text-[9px] uppercase tracking-[0.22em] text-black/55">
                  {mapHref ? (
                    <a className="transition hover:text-black" href={mapHref} target="_blank" rel="noreferrer">
                      {performance.venue}
                    </a>
                  ) : (
                    performance.venue
                  )}
                  {cityState ? <span className="text-black/45">{" • "}{cityState}</span> : null}
                </div>
              ) : locationLine ? (
                <div className="text-[9px] uppercase tracking-[0.22em] text-black/55">{locationLine}</div>
              ) : null}
            </div>
          </section>

          <section aria-label="Show content" className="grid min-h-0 gap-6 lg:grid-cols-2 lg:gap-8">
            <div className="flex min-h-0 flex-col">
              {embedUrl ? (
                <div className="aspect-[5/4] w-full overflow-hidden rounded-2xl border border-black/10 bg-black/[0.04]">
                  <iframe
                    className="h-full w-full"
                    src={embedUrl}
                    title={`${performance.title} video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-[5/4] w-full overflow-hidden rounded-2xl border border-black/10 bg-white px-4 py-4 text-center text-[9px] uppercase tracking-[0.28em] text-black/55">
                  <div className="flex h-full w-full items-center justify-center">
                    <div>
                      Video available on request.{" "}
                      <Link className="underline underline-offset-4" href={contactHref}>
                        Book / Contact
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex min-h-0 flex-col">
              {detailPhotos.length > 0 ? (
                <div className="aspect-[5/4] w-full overflow-hidden rounded-2xl border border-black/10 bg-black/[0.04]">
                  <div className="flex h-full w-full items-end justify-center gap-4 px-4 py-4">
                    {detailPhotos[0] ? (
                      <div className="h-full aspect-[9/16] overflow-hidden rounded-2xl border border-black/10 bg-black/[0.04]">
                        <img className="h-full w-full object-cover" src={detailPhotos[0]} alt={performance.title} />
                      </div>
                    ) : null}
                    {detailPhotos[1] ? (
                      <div className="aspect-[9/16] h-[70%] overflow-hidden rounded-2xl border border-black/10 bg-black/[0.04]">
                        <img className="h-full w-full object-cover" src={detailPhotos[1]} alt={performance.title} />
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <div className="flex justify-center">
            <Link
              href={contactHref}
              className="inline-flex h-10 items-center justify-center rounded-full bg-black px-6 text-[10px] uppercase tracking-[0.28em] text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Book / Contact
            </Link>
          </div>
        </div>
      </main>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-[5]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-[9px] uppercase tracking-[0.28em] text-black/50 sm:px-8 lg:px-10 xl:px-12">
          {prevPerformance ? (
            <Link className="pointer-events-auto hover:text-black" href={`/performance/${prevPerformance.slug}`}>
              ← Previous Performance
            </Link>
          ) : (
            <span className="text-black/30">← Previous Performance</span>
          )}
          {nextPerformance ? (
            <Link className="pointer-events-auto hover:text-black" href={`/performance/${nextPerformance.slug}`}>
              Next Performance →
            </Link>
          ) : (
            <span className="text-black/30">Next Performance →</span>
          )}
        </div>
      </div>
    </div>
  );
}
