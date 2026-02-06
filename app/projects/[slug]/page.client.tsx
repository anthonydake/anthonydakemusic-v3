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

  useEffect(() => {
    if (!project) return;
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-fade-section]"));
    if (reduce) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [project?.slug]);

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
          <ProjectTemplate
            title={project.title}
            artist={
              <TextScramble
                key={`${project.slug}-hero-${titleRun}`}
                text={artistLabel}
                duration={500}
                charset="#%&$@+|"
                scrambleFraction={0.35}
                trigger={titleRun}
              />
            }
            year={project.year}
            roles={project.role}
            audioEmbed={
              audioMedia.length ? (
                <div className="mx-auto w-full max-w-3xl space-y-6">
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
              )
            }
            creativeDirection={[
              "Defined sonic palette and aesthetic guardrails.",
              "Guided arrangement flow and emotional pacing.",
              "Directed performance details and session energy.",
              "Refined mix priorities for clarity and impact.",
            ]}
            processText={project.narrative[0] ?? "Short process overview placeholder."}
            processImage={
              <div className="mx-auto h-[clamp(200px,35vw,360px)] w-full max-w-3xl border border-black/10 bg-white" />
            }
            credits={{
              artist: indexItem?.artist ?? project.title,
              producer: project.role,
              writers: project.credits[0] ?? "—",
              engineer: project.credits[1] ?? "—",
              year: project.year,
            }}
            tags={project.tags}
            blurb={project.blurb}
            subtitle={subtitleLabel}
            prevProject={prevProject}
            nextProject={nextProject}
          />
        </main>
      </div>
    </>
  );
}

function ProjectTemplate({
  title,
  artist,
  year,
  roles,
  audioEmbed,
  creativeDirection,
  processText,
  processImage,
  credits,
  tags,
  blurb,
  subtitle,
  prevProject,
  nextProject,
}: {
  title: string;
  artist: React.ReactNode;
  year: number;
  roles: string;
  audioEmbed: React.ReactNode;
  creativeDirection: string[];
  processText: string;
  processImage: React.ReactNode;
  credits: {
    artist: string;
    producer: string;
    writers: string;
    engineer: string;
    year: number;
  };
  tags: string[];
  blurb: string;
  subtitle: string;
  prevProject: (typeof projectIndex)[number] | null;
  nextProject: (typeof projectIndex)[number] | null;
}) {
  return (
    <div className="flex flex-col gap-24">
      {/* HERO FRAME (Human Person-inspired) */}
      <section aria-label="Project hero" className="fade-section" data-fade-section>
        <div className="w-full border-y border-black/10 bg-white">
          <div className="mx-auto flex min-h-[min(720px,calc(100svh-240px))] w-full max-w-5xl items-center justify-center px-6 py-20 text-center sm:px-8 lg:px-10 lg:py-32 xl:px-12">
            <div className="space-y-6">
              <div className="text-[11px] uppercase tracking-[0.28em] text-black/45">{year}</div>
              <h1 className="text-balance text-[clamp(28px,4.5vw,64px)] font-semibold uppercase leading-[0.98] tracking-[0.02em] text-black">
                {title}
              </h1>
              <div className="text-[clamp(14px,2.1vw,24px)] uppercase tracking-[0.18em] text-black/70">{artist}</div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-black/55">Role · {roles}</div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-black/50">{subtitle}</div>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Audio" className="fade-section" data-fade-section>
        <div className="mx-auto w-full max-w-5xl space-y-8 py-20 text-center lg:py-32">
          <div className="h-px w-full bg-black/10" />
          <h2 className="text-[11px] uppercase tracking-[0.28em] text-black/60">The Record</h2>
          <div className="mx-auto w-full max-w-4xl bg-black/[0.04] p-6">
            {audioEmbed}
          </div>
        </div>
      </section>

      <section aria-label="Creative direction" className="fade-section" data-fade-section>
        <div className="mx-auto w-full max-w-4xl space-y-6 py-20 lg:py-32">
          <div className="h-px w-full bg-black/10" />
          <h2 className="text-[11px] uppercase tracking-[0.28em] text-black/60">Creative Direction</h2>
          <p className="text-[15px] leading-relaxed text-black/70">{blurb}</p>
          <ul className="mx-auto w-full max-w-3xl list-disc space-y-2 text-[13px] leading-relaxed text-black/60">
            {creativeDirection.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {tags.length ? (
            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-black/45">
              {tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section aria-label="Process" className="fade-section" data-fade-section>
        <div className="mx-auto w-full max-w-4xl space-y-6 py-20 lg:py-32">
          <div className="h-px w-full bg-black/10" />
          <h2 className="text-center text-[11px] uppercase tracking-[0.28em] text-black/60">Process</h2>
          <p className="mx-auto w-full max-w-3xl text-[14px] leading-relaxed text-black/60">{processText}</p>
          <div className="pt-4">
            <div className="bg-black/[0.03] p-4">{processImage}</div>
          </div>
        </div>
      </section>

      <section aria-label="Credits" className="fade-section" data-fade-section>
        <div className="mx-auto w-full max-w-4xl space-y-6 py-20 lg:py-32">
          <div className="h-px w-full bg-black/10" />
          <h2 className="text-center text-[11px] uppercase tracking-[0.28em] text-black/60">Credits</h2>
          <div className="mx-auto grid gap-x-10 gap-y-4 text-[12px] text-black/65 sm:grid-cols-[140px_minmax(0,1fr)]">
            <div className="uppercase tracking-[0.22em] text-black/35">Artist</div>
            <div>{credits.artist}</div>
            <div className="uppercase tracking-[0.22em] text-black/35">Producer</div>
            <div>{credits.producer}</div>
            <div className="uppercase tracking-[0.22em] text-black/35">Writers</div>
            <div>{credits.writers}</div>
            <div className="uppercase tracking-[0.22em] text-black/35">Engineer</div>
            <div>{credits.engineer}</div>
            <div className="uppercase tracking-[0.22em] text-black/35">Year</div>
            <div>{credits.year}</div>
          </div>
        </div>
      </section>

      <section aria-label="Previous and next" className="fade-section" data-fade-section>
        <div className="mx-auto w-full max-w-4xl pt-12">
          <div className="h-px w-full bg-black/10" />
          <div className="mt-8 flex items-center justify-between gap-6 py-6 text-[12px] tracking-[0.2em] text-black/50">
          {prevProject ? (
            <Link className="transition-all duration-200 ease-out hover:underline hover:underline-offset-4 hover:text-black" href={`/projects/${prevProject.slug}`}>
              ← Previous Project
            </Link>
          ) : (
            <span className="text-black/30">← Previous Project</span>
          )}
          {nextProject ? (
            <Link className="transition-all duration-200 ease-out hover:underline hover:underline-offset-4 hover:text-black" href={`/projects/${nextProject.slug}`}>
              Next Project →
            </Link>
          ) : (
            <span className="text-black/30">Next Project →</span>
          )}
          </div>
        </div>
      </section>
    </div>
  );
}
