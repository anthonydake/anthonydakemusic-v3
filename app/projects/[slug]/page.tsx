"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import TextScramble from "@/app/components/TextScramble";
import { ProjectMedia, projects } from "@/lib/projects";
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
        <div className="fixed inset-x-0 top-0 z-[9999] isolate h-14 bg-white">
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
        <main className="min-h-screen bg-white px-6 pb-20 pt-20 font-sans text-black">
          <div className="pt-14 text-center text-sm text-black/60">Project not found.</div>
        </main>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[9999] isolate h-14 bg-white">
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
      <main className="relative min-h-screen bg-white font-sans text-black">
        {/* Hairline frame + gridlines (desktop) */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          <div className="mx-auto h-full max-w-[1600px] px-6 sm:px-8 lg:px-10 xl:px-12">
            <div className="relative h-full">
              <div className="absolute inset-y-0 left-[clamp(220px,18vw,300px)] w-px bg-black/10" />
              <div className="absolute inset-y-0 left-[calc(clamp(220px,18vw,300px)+clamp(260px,28vw,520px))] w-px bg-black/10" />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1600px] px-6 pb-24 pt-24 sm:px-8 lg:px-10 xl:px-12">
          <div className="flex items-baseline justify-between gap-6">
            <Link className="text-[11px] uppercase tracking-[0.28em] text-black/70 hover:text-black" href="/projects">
              ← Back to Projects
            </Link>
            <div className="text-[11px] uppercase tracking-[0.28em] text-black/55">
              {indexItem?.date ? <span className="tabular-nums">{indexItem.date}</span> : <span className="tabular-nums">{project.year}</span>}
              <span className="mx-3 inline-block align-middle text-[14px] font-semibold leading-none">•</span>
              {indexItem?.artist ? <span>{indexItem.artist}</span> : <span>{project.role}</span>}
            </div>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[clamp(220px,18vw,300px)_minmax(0,1fr)] lg:gap-0">
            {/* Left meta column */}
            <aside className="space-y-8 lg:pr-10">
              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-[0.28em] text-black/55">Project</div>
                <h1
                  className="text-3xl font-semibold leading-tight tracking-[0.06em] sm:text-4xl"
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
                <div className="text-[12px] uppercase tracking-[0.22em] text-black/65">{project.subtitle}</div>
              </div>

              <div className="space-y-1 text-[11px] uppercase tracking-[0.28em] text-black/60">
                <div>
                  <span className="text-black/40">Role</span>
                  <span className="mx-2">—</span>
                  <span className="text-black/80">{project.role}</span>
                </div>
                <div>
                  <span className="text-black/40">Year</span>
                  <span className="mx-2">—</span>
                  <span className="text-black/80 tabular-nums">{project.year}</span>
                </div>
                {indexItem?.workTags?.length ? (
                  <div className="pt-2 text-[11px] tracking-[0.18em] text-black/55 italic">
                    {indexItem.workTags.join(", ")}
                  </div>
                ) : null}
              </div>

              <div className="h-px w-full bg-black/10" />

              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-[0.28em] text-black/55">Links</div>
                <ul className="space-y-2 text-[12px] uppercase tracking-[0.22em] text-black/70">
                  {project.links.map((link) => (
                    <li key={link.href}>
                      <a className="underline underline-offset-4 hover:text-black" href={link.href} target="_blank" rel="noreferrer">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {project.deliverables.length > 0 && (
                <>
                  <div className="h-px w-full bg-black/10" />
                  <MetaList title="Deliverables" items={project.deliverables} />
                </>
              )}

              {project.credits.length > 0 && (
                <>
                  <div className="h-px w-full bg-black/10" />
                  <MetaList title="Credits" items={project.credits} />
                </>
              )}
            </aside>

            {/* Right content column */}
            <section className="lg:pl-10">
              <div className="space-y-10">
                <div className="space-y-3">
                  <div className="text-[11px] uppercase tracking-[0.28em] text-black/55">Notes</div>
                  {project.narrative.map((para) => (
                    <p key={para.slice(0, 24)} className="max-w-3xl text-base leading-7 text-black/75">
                      {para}
                    </p>
                  ))}
                </div>

                {project.media.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-black/55">Media</div>
                    <div className="grid gap-6 md:grid-cols-2">
                      {project.media.map((m, idx) => (
                        <MediaEmbed key={`${project.slug}-${idx}-${m.kind}`} media={m} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

function MetaList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] uppercase tracking-[0.28em] text-black/55">{title}</div>
      <ul className="space-y-1 text-[12px] leading-6 text-black/70">
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
      <div className="overflow-hidden border border-black/10 bg-black">
        <div className="relative aspect-video">
          <iframe
            src={src}
            title={media.title || "Video embed"}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {media.title && <div className="px-4 py-3 text-[11px] uppercase tracking-[0.28em] text-white/70">{media.title}</div>}
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
        {media.title && <div className="px-4 py-3 text-[11px] uppercase tracking-[0.28em] text-black/60">{media.title}</div>}
      </div>
    );
  }

  if (media.kind === "image") {
    return (
      <div className="overflow-hidden border border-black/10 bg-white">
        <div className="relative aspect-video overflow-hidden bg-black/5">
          <Image src={media.src} alt={media.alt} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
        </div>
        {media.title && <div className="px-4 py-3 text-[11px] uppercase tracking-[0.28em] text-black/60">{media.title}</div>}
      </div>
    );
  }

  return null;
}
