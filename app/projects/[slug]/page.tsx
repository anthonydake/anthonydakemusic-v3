"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import TextScramble from "@/app/components/TextScramble";
import { type ProjectMedia, projects } from "@/lib/projects";
import { projectIndex } from "@/data/projects.data";

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

export default function ProjectDetailPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const project = projects.find((p) => p.slug === slug);
  const indexItem = projectIndex.find((p) => p.slug === slug);
  const [titleRun, setTitleRun] = useState(0);
  const [now, setNow] = useState<Date>(() => new Date());
  const [locationLabel, setLocationLabel] = useState(() => {
    if (typeof window === "undefined") return "LOCATION UNAVAILABLE";
    return window.localStorage.getItem("ad_location_label_v1") ?? "LOCATION UNAVAILABLE";
  });

  type ImageMedia = Extract<ProjectMedia, { kind: "image" }>;
  const heroImage = (project?.media.find((m): m is ImageMedia => m.kind === "image") as ImageMedia | undefined) ?? null;

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

  const timeLabel = useMemo(() => formatLocalTime(now), [now]);

  if (!project) {
    return (
      <>
        <div className="relative min-h-screen bg-white text-black">
          {/* Vertical hairline gridlines (desktop only) */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            <div className="mx-auto h-full max-w-[1600px] px-6 sm:px-8 lg:px-10 xl:px-12">
              <div className="relative h-full">
                <div className="absolute inset-y-0 left-1/4 w-px bg-black/10" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-black/10" />
                <div className="absolute inset-y-0 left-3/4 w-px bg-black/10" />
              </div>
            </div>
          </div>

          {/* Header (match /projects) */}
          <div className="fixed inset-x-0 top-0 z-[50] bg-white">
            <div className="mx-auto grid max-w-[1600px] grid-cols-[1fr_auto_1fr] items-start px-6 pt-6 text-[11px] uppercase tracking-[0.28em] text-black/80 sm:px-8 lg:px-10 xl:px-12">
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

            <div className="mx-auto mt-4 max-w-[1600px] px-6 sm:px-8 lg:px-10 xl:px-12">
              <div className="h-px w-full bg-black/10" />
            </div>
          </div>

          <main className="relative z-[10] mx-auto max-w-[1600px] px-6 pb-24 pt-40 sm:px-8 lg:px-10 xl:px-12">
            <div className="text-center text-sm text-black/60">Project not found.</div>
          </main>
        </div>
      </>
    );
  }

  const artistLabel = (indexItem?.artist ?? project.title).toUpperCase();
  const contextLabel = project.title.toUpperCase();
  const subtitleLabel = project.subtitle.toUpperCase();

  return (
    <>
      <div className="relative min-h-screen bg-white text-black">
        {/* Vertical hairline gridlines (desktop only) */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <div className="mx-auto h-full max-w-[1600px] px-6 sm:px-8 lg:px-10 xl:px-12">
            <div className="relative h-full">
              <div className="absolute inset-y-0 left-1/4 w-px bg-black/10" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-black/10" />
              <div className="absolute inset-y-0 left-3/4 w-px bg-black/10" />
            </div>
          </div>
        </div>

        {/* Header (match /projects) */}
        <div className="fixed inset-x-0 top-0 z-[50] bg-white">
          <div className="mx-auto grid max-w-[1600px] grid-cols-[1fr_auto_1fr] items-start px-6 pt-6 text-[11px] uppercase tracking-[0.28em] text-black/80 sm:px-8 lg:px-10 xl:px-12">
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

          <div className="mx-auto mt-4 max-w-[1600px] px-6 sm:px-8 lg:px-10 xl:px-12">
            <div className="h-px w-full bg-black/10" />
          </div>
        </div>

        <main className="relative z-[10] mx-auto max-w-[1600px] px-6 pb-24 pt-40 sm:px-8 lg:px-10 xl:px-12">
          <div className="flex flex-col gap-20">
            {/* HERO FRAME (Human Person-inspired) */}
            <section aria-label="Project hero">
              <div className="grid gap-8 lg:grid-cols-[clamp(48px,6vw,140px)_minmax(0,1fr)_clamp(48px,6vw,140px)] lg:gap-0">
                {/* Left gutter (reserved spacing) */}
                <div className="hidden lg:block lg:py-10 lg:pr-6" />

                {/* Blueprint canvas + bottom image strip */}
                <div className="border border-black/10 bg-white">
                  <div className="flex min-h-[min(760px,calc(100svh-240px))] flex-col">
                    <div className="relative flex-1 overflow-hidden">
                      <BlueprintGrid />

                      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                        <div className="text-[11px] uppercase tracking-[0.28em] text-black/60">( {contextLabel} )</div>

                        <h1
                          className="mt-8 max-w-[14ch] text-balance text-[clamp(64px,10vw,180px)] font-semibold uppercase leading-[0.9] tracking-[0.02em] text-black"
                          onMouseEnter={() => setTitleRun((n) => n + 1)}
                          onMouseLeave={() => setTitleRun((n) => n + 1)}
                        >
                          <TextScramble
                            key={`${project.slug}-hero-${titleRun}`}
                            text={artistLabel}
                            duration={500}
                            charset="#%&$@+|"
                            scrambleFraction={0.35}
                            trigger={titleRun}
                          />
                        </h1>

                        <div className="mt-10 text-[11px] uppercase tracking-[0.28em] text-black/55">{subtitleLabel}</div>
                      </div>
                    </div>

                    <div className="border-t border-black/10 bg-white">
                      <div className="relative h-[clamp(180px,26vh,340px)] w-full bg-black/5">
                        {heroImage ? (
                          <Image
                            src={heroImage.src}
                            alt={heroImage.alt}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 1200px, 100vw"
                            priority
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right gutter (reserved spacing) */}
                <div className="hidden lg:block lg:py-10 lg:pl-6" />

                {/* Mobile: no footer labels */}
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

function BlueprintGrid() {
  const v = [16.6667, 33.3333, 50, 66.6667, 83.3333];
  const h = [20, 40, 60, 80];

  return (
    <div className="pointer-events-none absolute inset-0">
      {v.map((p) => (
        <div key={`v-${p}`} className="absolute inset-y-0 w-px bg-black/15" style={{ left: `${p}%` }} />
      ))}
      {h.map((p) => (
        <div key={`h-${p}`} className="absolute inset-x-0 h-px bg-black/15" style={{ top: `${p}%` }} />
      ))}
    </div>
  );
}
