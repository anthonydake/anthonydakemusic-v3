"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import TextScramble from "@/app/components/TextScramble";
import { projects } from "@/lib/projects";
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

export default function ProjectDetailClient() {
  const params = useParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const project = projects.find((p) => p.slug === slug);
  const indexItem = projectIndex.find((p) => p.slug === slug);
  const [titleRun, setTitleRun] = useState(0);
  const [now, setNow] = useState<Date>(() => new Date());
  const [showLiveTime, setShowLiveTime] = useState(false);
  const [initialTime] = useState(() => formatColumbusTime(new Date()));

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
  const audioMedia = project.media.filter((m) => m.kind === "audio");
  const projectIndexPosition = projectIndex.findIndex((p) => p.slug === project.slug);
  const prevProject = projectIndexPosition > 0 ? projectIndex[projectIndexPosition - 1] : null;
  const nextProject =
    projectIndexPosition >= 0 && projectIndexPosition < projectIndex.length - 1
      ? projectIndex[projectIndexPosition + 1]
      : null;

  return (
    <>
      <div className="relative min-h-screen bg-white text-black">
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
          <div className="flex flex-col gap-24">
            {/* HERO FRAME (Human Person-inspired) */}
            <section aria-label="Project hero">
              <div className="w-full border-y border-black/10 bg-white">
                <div className="mx-auto flex min-h-[min(720px,calc(100svh-240px))] w-full max-w-5xl items-center justify-center px-6 py-24 text-center sm:px-8 lg:px-10 xl:px-12">
                  <div className="space-y-6">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-black/45">{project.year}</div>
                    <h1
                      className="text-balance text-[clamp(28px,4.5vw,64px)] font-semibold uppercase leading-[0.98] tracking-[0.02em] text-black"
                      onMouseEnter={() => setTitleRun((n) => n + 1)}
                      onMouseLeave={() => setTitleRun((n) => n + 1)}
                    >
                      {project.title}
                    </h1>
                    <div className="text-[clamp(14px,2.1vw,24px)] uppercase tracking-[0.18em] text-black/70">
                      <TextScramble
                        key={`${project.slug}-hero-${titleRun}`}
                        text={artistLabel}
                        duration={500}
                        charset="#%&$@+|"
                        scrambleFraction={0.35}
                        trigger={titleRun}
                      />
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.28em] text-black/55">Role · {project.role}</div>
                    <div className="text-[11px] uppercase tracking-[0.28em] text-black/50">{subtitleLabel}</div>
                  </div>
                </div>
              </div>
            </section>

            <section aria-label="Audio">
              <div className="mx-auto w-full max-w-4xl space-y-6">
                <h2 className="text-[11px] uppercase tracking-[0.28em] text-black/60">Audio</h2>
                {audioMedia.length ? (
                  <div className="space-y-6">
                    {audioMedia.map((item, idx) => (
                      <div key={`${project.slug}-audio-${idx}`} className="border border-black/10 bg-white p-4">
                        <div className="text-[12px] uppercase tracking-[0.24em] text-black/70">{item.title ?? "Audio"}</div>
                        <div className="mt-3 text-[12px] text-black/60">
                          <a className="hover:text-black" href={item.url} target="_blank" rel="noreferrer">
                            Open {item.provider.replace("_", " ")}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-black/50">Audio assets coming soon.</div>
                )}
              </div>
            </section>

            <section aria-label="Creative direction">
              <div className="mx-auto w-full max-w-4xl space-y-6">
                <h2 className="text-[11px] uppercase tracking-[0.28em] text-black/60">Creative Direction</h2>
                <p className="text-[15px] leading-relaxed text-black/70">{project.blurb}</p>
                {project.tags.length ? (
                  <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-black/45">
                    {project.tags.map((tag) => (
                      <span key={`${project.slug}-tag-${tag}`}>{tag}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>

            <section aria-label="Process">
              <div className="mx-auto w-full max-w-4xl space-y-6">
                <h2 className="text-[11px] uppercase tracking-[0.28em] text-black/60">Process</h2>
                {project.narrative.length ? (
                  <div className="space-y-4 text-[15px] leading-relaxed text-black/70">
                    {project.narrative.map((line, idx) => (
                      <p key={`${project.slug}-narrative-${idx}`}>{line}</p>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-black/50">Process notes coming soon.</div>
                )}
              </div>
            </section>

            <section aria-label="Credits">
              <div className="mx-auto w-full max-w-4xl space-y-6">
                <h2 className="text-[11px] uppercase tracking-[0.28em] text-black/60">Credits</h2>
                {project.credits.length ? (
                  <ul className="space-y-2 text-[13px] text-black/70">
                    {project.credits.map((credit) => (
                      <li key={`${project.slug}-credit-${credit}`}>{credit}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-black/50">Credits coming soon.</div>
                )}
              </div>
            </section>

            <section aria-label="Previous and next">
              <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-6 text-[11px] uppercase tracking-[0.28em] text-black/60">
                {prevProject ? (
                  <Link className="hover:text-black" href={`/projects/${prevProject.slug}`}>
                    Previous
                  </Link>
                ) : (
                  <span className="text-black/30">Previous</span>
                )}
                {nextProject ? (
                  <Link className="hover:text-black" href={`/projects/${nextProject.slug}`}>
                    Next
                  </Link>
                ) : (
                  <span className="text-black/30">Next</span>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
