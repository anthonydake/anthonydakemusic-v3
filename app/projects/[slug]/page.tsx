"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
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

  // Desktop/table column sizing (used by top row grid + background hairlines).
  const frameStyle = useMemo(() => {
    return {
      ["--col1"]: "clamp(220px, 18vw, 300px)",
      ["--col2"]: "clamp(260px, 28vw, 520px)",
    } as CSSProperties;
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

  const timeLabel = useMemo(() => formatLocalTime(now), [now]);

  if (!project) {
    return (
      <>
        <div className="relative min-h-screen bg-white text-black">
          {/* Vertical hairline gridlines (desktop only) */}
          <div className="pointer-events-none absolute inset-0 hidden lg:block">
            <div className="mx-auto h-full max-w-[1600px] px-6 sm:px-8 lg:px-10 xl:px-12">
              <div className="relative h-full" style={frameStyle}>
                <div className="absolute inset-y-0 left-[var(--col1)] w-px bg-black/10" />
                <div className="absolute inset-y-0 left-[calc(var(--col1)+var(--col2))] w-px bg-black/10" />
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

  return (
    <>
      <div className="relative min-h-screen bg-white text-black">
        {/* Vertical hairline gridlines (desktop only) */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <div className="mx-auto h-full max-w-[1600px] px-6 sm:px-8 lg:px-10 xl:px-12">
            <div className="relative h-full" style={frameStyle}>
              <div className="absolute inset-y-0 left-[var(--col1)] w-px bg-black/10" />
              <div className="absolute inset-y-0 left-[calc(var(--col1)+var(--col2))] w-px bg-black/10" />
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

        <main className="relative z-[10] mx-auto max-w-[1600px] px-6 pb-24 pt-40 sm:px-8 lg:px-10 xl:px-12" style={frameStyle}>
          <div className="flex flex-col gap-14">
            {/* Top "index row" framing to match /projects proportions */}
            <div className="flex flex-col gap-2 lg:grid lg:grid-cols-[var(--col1)_var(--col2)_minmax(0,1fr)] lg:items-start lg:gap-x-8">
              <div className="space-y-4">
                <Link className="text-[11px] uppercase tracking-[0.28em] text-black/70 hover:text-black" href="/projects">
                  ← Back to Projects
                </Link>
                <div className="text-[12px] uppercase tracking-[0.22em] lg:text-[11px]">
                  <span className="tabular-nums">{indexItem?.date ?? String(project.year)}</span>{" "}
                  <span className="text-black/55">{indexItem?.artist ?? project.role}</span>
                </div>
              </div>

              <div className="text-[12px] tracking-[0.18em] italic text-black/55 lg:pt-[34px] lg:text-[11px] lg:not-italic">
                {indexItem?.workTags?.length ? indexItem.workTags.join(", ") : project.role}
              </div>

              <div className="space-y-3">
                <h1
                  className="text-[28px] font-medium uppercase leading-[1.08] tracking-[0.10em] sm:text-[34px] md:text-[40px]"
                  onMouseEnter={() => setTitleRun((n) => n + 1)}
                  onMouseLeave={() => setTitleRun((n) => n + 1)}
                >
                  <TextScramble
                    key={`${project.slug}-title-${titleRun}`}
                    text={project.title.toUpperCase()}
                    duration={500}
                    charset="#%&$@+|"
                    scrambleFraction={0.35}
                    trigger={titleRun}
                  />
                </h1>
                <div className="text-[12px] uppercase tracking-[0.22em] text-black/65">{project.subtitle.toUpperCase()}</div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-black/55">
                  <span className="text-black/40">Role</span>
                  <span className="mx-2">—</span>
                  <span className="text-black/80">{project.role}</span>
                  <span className="mx-3 inline-block align-middle text-[14px] font-semibold leading-none">•</span>
                  <span className="text-black/80 tabular-nums">{project.year}</span>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-black/10" />

            <div className="mx-auto w-full max-w-[1100px] space-y-12">
              {/* Links (keep primary actions high, minimal) */}
              <div className="space-y-3">
                <div className="text-[11px] uppercase tracking-[0.28em] text-black/55">Links</div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] uppercase tracking-[0.22em] text-black/70">
                  {project.links.map((link) => (
                    <a
                      key={link.href}
                      className="underline underline-offset-4 hover:text-black"
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-black/10" />

              {/* Narrative + media interleaved (single column, wide + efficient) */}
              <Story project={project} />

              {(project.deliverables.length > 0 || project.credits.length > 0) && (
                <>
                  <div className="h-px w-full bg-black/10" />
                  <div className="grid gap-10 md:grid-cols-2">
                    {project.deliverables.length > 0 ? <MetaList title="Deliverables" items={project.deliverables} /> : <div />}
                    {project.credits.length > 0 ? <MetaList title="Credits" items={project.credits} /> : <div />}
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function MetaList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] uppercase tracking-[0.28em] text-black/55">{title}</div>
      <ul className="space-y-1 text-[11px] uppercase tracking-[0.22em] leading-6 text-black/70">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function MediaEmbed({ media }: { media: ProjectMedia }) {
  if (media.kind === "video") {
    const src =
      media.provider === "youtube"
        ? `https://www.youtube.com/embed/${media.id}`
        : `https://player.vimeo.com/video/${media.id}`;

    return (
      <div className="overflow-hidden border border-black/10 bg-white">
        <div className="relative aspect-video">
          <iframe
            src={src}
            title={media.title || "Video embed"}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (media.kind === "audio") {
    return (
      <div className="overflow-hidden border border-black/10 bg-white">
        <iframe
          title={media.title || "Audio embed"}
          src={media.url}
          className="w-full"
          style={{ height: media.height ?? 160 }}
          allow="autoplay; clipboard-write; encrypted-media"
        />
      </div>
    );
  }

  if (media.kind === "image") {
    return (
      <div className="overflow-hidden border border-black/10 bg-white">
        <div className="relative aspect-[3/2] overflow-hidden bg-black/5">
          <Image src={media.src} alt={media.alt} fill className="object-cover" sizes="(min-width: 1024px) 1100px, 100vw" />
        </div>
      </div>
    );
  }

  return null;
}

function Story({ project }: { project: { narrative: string[]; media: ProjectMedia[] } }) {
  type ImageMedia = Extract<ProjectMedia, { kind: "image" }>;
  const hero = project.media.find((m): m is ImageMedia => m.kind === "image") ?? null;
  const rest = hero ? project.media.filter((m) => m !== hero) : project.media;

  const blocks = useMemo(() => {
    const out: Array<{ kind: "text"; text: string } | { kind: "media"; media: ProjectMedia }> = [];
    const mediaQueue = [...rest];

    project.narrative.forEach((para) => {
      out.push({ kind: "text", text: para });
      const next = mediaQueue.shift();
      if (next) out.push({ kind: "media", media: next });
    });

    mediaQueue.forEach((m) => out.push({ kind: "media", media: m }));
    return out;
  }, [project.narrative, rest]);

  return (
    <div className="space-y-10">
      {hero ? (
        <div className="overflow-hidden border border-black/10 bg-white">
          <div className="relative aspect-[3/2] overflow-hidden bg-black/5">
            <Image src={hero.src} alt={hero.alt} fill className="object-cover" sizes="(min-width: 1024px) 1100px, 100vw" />
          </div>
        </div>
      ) : null}

      <div className="space-y-10">
        {blocks.map((b, idx) => {
          if (b.kind === "text") {
            return (
              <p key={`t-${idx}-${b.text.slice(0, 18)}`} className="max-w-[72ch] text-[15px] leading-7 text-black/80">
                {b.text}
              </p>
            );
          }

          return <MediaEmbed key={`m-${idx}-${b.media.kind}`} media={b.media} />;
        })}
      </div>
    </div>
  );
}
