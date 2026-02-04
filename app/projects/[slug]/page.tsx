"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import TextScramble from "@/app/components/TextScramble";
import { ProjectMedia, projects } from "@/lib/projects";

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
        <main className="min-h-screen bg-[#f9f7f2] px-6 pb-20 pt-20 font-sans text-[#0c0c0b]">
          <div className="pt-14 text-center text-sm text-black/60">Project not found.</div>
        </main>
      </>
    );
  }

  return (
    <>
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
      <main className="min-h-screen bg-[#f9f7f2] px-6 pb-20 pt-20 font-sans text-[#0c0c0b]">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="flex items-center justify-between">
            <Link className="text-sm underline underline-offset-4" href="/projects">
              ← Back to Projects
            </Link>
            <div className="text-xs uppercase tracking-[0.22em] text-black/50">
              {project.role} • {project.year}
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-2xl">
            <header className="relative overflow-hidden text-white">
              <div
                className="absolute inset-0"
                style={{ backgroundImage: `linear-gradient(135deg, ${project.tone[0]}, ${project.tone[1]})` }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.12),transparent_45%)]" />
              <div className="relative px-6 py-12 sm:px-10 sm:py-16">
                <p className="text-xs uppercase tracking-[0.32em] text-white/80">{project.tags.join(" • ")}</p>
                <h1
                  className="mt-4 text-4xl font-semibold leading-tight tracking-[0.06em] sm:text-5xl"
                  onMouseEnter={() => setTitleRun((n) => n + 1)}
                  onMouseLeave={() => setTitleRun((n) => n + 1)}
                >
                  <TextScramble
                    key={`${project.slug}-title-${titleRun}`}
                    text={project.title}
                    duration={500}
                    charset="#%&$@+|"
                    scrambleFraction={0.35}
                    trigger={titleRun}
                  />
                </h1>
                <p className="mt-3 max-w-3xl text-lg text-white/85">{project.subtitle}</p>
                <div className="mt-6 flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.24em] text-white/80">
                  <span className="rounded-full border border-white/30 px-3 py-1">{project.role}</span>
                  <span className="rounded-full border border-white/30 px-3 py-1">{project.year}</span>
                </div>
              </div>
            </header>

            <div className="grid gap-10 px-6 py-10 sm:px-10">
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Backstory & Approach</h2>
                {project.narrative.map((para) => (
                  <p key={para.slice(0, 16)} className="text-base leading-7 text-black/70">
                    {para}
                  </p>
                ))}
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <InfoBlock title="Deliverables" items={project.deliverables} />
                <InfoBlock title="Credits" items={project.credits} />
                <InfoBlock title="Tags" items={project.tags} />
              </div>

              {project.media.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm uppercase tracking-[0.28em] text-black/60">Media</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {project.media.map((m, idx) => (
                      <MediaEmbed key={`${project.slug}-${idx}-${m.kind}`} media={m} />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm uppercase tracking-[0.28em] text-black/60">Links</h3>
                  <ul className="space-y-2 text-sm">
                    {project.links.map((link) => (
                      <li key={link.href}>
                        <a className="underline underline-offset-4" href={link.href} target="_blank" rel="noreferrer">
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm uppercase tracking-[0.28em] text-black/60">Roles</h3>
                  <p className="text-sm leading-7 text-black/70">
                    Role focus: {project.role}. I tailor playback, stems, and drum tones so every venue or platform
                    hears the same intent the artist and I built in the studio.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link className="underline underline-offset-4" href="/#index">
              Home
            </Link>
            <Link className="underline underline-offset-4" href="/contact">
              Book this energy
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function InfoBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[18px] border border-black/10 bg-[#f5f3ee] p-4">
      <p className="text-xs uppercase tracking-[0.26em] text-black/50">{title}</p>
      <ul className="mt-3 space-y-1 text-sm text-black/75">
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
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-black/90 shadow-lg">
        <div className="relative aspect-video">
          <iframe
            src={src}
            title={media.title || "Video embed"}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {media.title && <div className="px-4 py-3 text-sm text-white/80">{media.title}</div>}
      </div>
    );
  }

  if (media.kind === "audio") {
    return (
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg">
        <iframe
          title={media.title || "Audio embed"}
          src={media.url}
          className="w-full"
          style={{ height: media.height ?? 160 }}
          allow="autoplay; clipboard-write; encrypted-media"
        />
        {media.title && <div className="px-4 py-3 text-sm text-black/70">{media.title}</div>}
      </div>
    );
  }

  if (media.kind === "image") {
    return (
      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg">
        <div className="relative aspect-video overflow-hidden">
          {/* Regular img keeps this zero-config; replace with next/image if assets are local */}
          <img src={media.src} alt={media.alt} className="h-full w-full object-cover" />
        </div>
        {media.title && <div className="px-4 py-3 text-sm text-black/70">{media.title}</div>}
      </div>
    );
  }

  return null;
}
