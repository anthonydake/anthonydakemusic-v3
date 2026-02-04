"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import TextScramble from "@/app/components/TextScramble";
import { type ProjectMedia, projects } from "@/lib/projects";
import { projectIndex } from "@/data/projects.data";

function formatColumbusTime(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return fmt.format(d);
}

export default function ProjectDetailPage() {
  const params = useParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const project = projects.find((p) => p.slug === slug);
  const indexItem = projectIndex.find((p) => p.slug === slug);
  const [titleRun, setTitleRun] = useState(0);
  const [now, setNow] = useState<Date>(() => new Date());
  const [showLiveTime, setShowLiveTime] = useState(false);
  const [initialTime] = useState(() => formatColumbusTime(new Date()));

  type ImageMedia = Extract<ProjectMedia, { kind: "image" }>;
  const heroImage = (project?.media.find((m): m is ImageMedia => m.kind === "image") as ImageMedia | undefined) ?? null;

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

  const timeLabel = useMemo(() => formatColumbusTime(now), [now]);

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

          {/* Header (match home) */}
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
                href="/"
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

        {/* Header (match home) */}
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
              href="/"
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

                      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
                        <div className="text-[11px] uppercase tracking-[0.28em] text-black/60">( {contextLabel} )</div>

                        <h1
                          className="mt-8 max-w-[14ch] text-balance text-[clamp(16px,2.5vw,45px)] font-normal uppercase leading-[0.9] tracking-[0.02em] text-black"
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
    <div
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        // Keep the grid as a background layer (separate from foreground content).
        WebkitMaskImage:
          "radial-gradient(circle at 50% 50%, transparent 0, transparent 180px, black 250px)",
        maskImage: "radial-gradient(circle at 50% 50%, transparent 0, transparent 180px, black 250px)",
      }}
    >
      {v.map((p) => (
        <div key={`v-${p}`} className="absolute inset-y-0 w-px bg-black/12" style={{ left: `${p}%` }} />
      ))}
      {h.map((p) => (
        <div key={`h-${p}`} className="absolute inset-x-0 h-px bg-black/12" style={{ top: `${p}%` }} />
      ))}
    </div>
  );
}
