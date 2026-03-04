"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import ColumbusTime from "@/app/components/ColumbusTime";
import HomeMark from "@/app/components/HomeMark";
import { projectIndex } from "@/data/projects.data";
import { projects, type ProjectMedia } from "@/lib/projects";

function parseSortKeyMMDDYYYY(date: string) {
  const m = Number(date.slice(0, 2));
  const d = Number(date.slice(3, 5));
  const y = Number(date.slice(6, 10));
  if (!Number.isFinite(m) || !Number.isFinite(d) || !Number.isFinite(y)) return 0;
  return y * 10000 + m * 100 + d;
}

function getVideoEmbedUrl(media: Extract<ProjectMedia, { kind: "video" }>) {
  if (media.provider === "youtube") return `https://www.youtube.com/embed/${media.id}`;
  return `https://player.vimeo.com/video/${media.id}`;
}

export default function ProjectDetailClient() {
  const pathname = usePathname();
  const currentSlug = useMemo(() => pathname?.split("/").filter(Boolean).pop() || null, [pathname]);
  const project = useMemo(() => projects.find((p) => p.slug === currentSlug) || null, [currentSlug]);

  const orderedIndex = useMemo(
    () => [...projectIndex].sort((a, b) => parseSortKeyMMDDYYYY(b.date) - parseSortKeyMMDDYYYY(a.date)),
    []
  );
  const currentIndex = currentSlug ? orderedIndex.findIndex((p) => p.slug === currentSlug) : -1;
  const prevProject = currentIndex > 0 ? orderedIndex[currentIndex - 1] : null;
  const nextProject =
    currentIndex >= 0 && currentIndex < orderedIndex.length - 1 ? orderedIndex[currentIndex + 1] : null;

  if (!project) {
    return (
      <div className="relative min-h-screen bg-white text-black">
        <div className="fixed inset-x-0 top-0 z-[9999] isolate h-14 bg-white/70 backdrop-blur">
          <div className="mx-auto grid h-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 text-[11.6875px] uppercase tracking-[0.28em] text-black/65">
            <div className="justify-self-start">
              <Link className="md:hidden hover:text-black" href="/placements">
                Placements
              </Link>
              <div className="hidden items-center md:flex">
                <span>Columbus, (OH)</span>
                <span className="mx-2 inline-block align-middle text-[14.875px] font-semibold leading-none">•</span>
                <ColumbusTime />
              </div>
            </div>

            <Link
              href="/"
              className="group inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <HomeMark className="h-[18px] w-[18px] transition group-hover:scale-[1.04] group-hover:brightness-110" />
            </Link>

            <div className="justify-self-end">
              <Link className="md:hidden hover:text-black" href="/performance">
                Performance
              </Link>
              <nav className="hidden items-center gap-6 md:flex">
                <Link className="hover:text-black" href="/placements">
                  Placements
                </Link>
                <Link className="hover:text-black" href="/performance">
                  Performance
                </Link>
              </nav>
            </div>
          </div>
        </div>

        <main className="relative z-[10] mx-auto max-w-5xl px-6 pb-24 pt-24 text-center sm:px-8 lg:px-10 xl:px-12">
          <div className="space-y-6">
            <div className="text-[10.625px] uppercase tracking-[0.28em] text-black/45">Placements</div>
            <h1 className="text-balance text-[clamp(25.5px,3.4vw,48.875px)] font-medium uppercase tracking-[0.02em] text-black">
              Project Unavailable
            </h1>
            <p className="text-[0.9375rem] text-black/60">This placement detail isn&apos;t live yet.</p>
            <Link
              href="mailto:adakemusic@gmail.com"
              className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-[11.6875px] uppercase tracking-[0.28em] text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Book / Contact
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white text-black">
      <div className="fixed inset-x-0 top-0 z-[9999] isolate h-14 bg-white/70 backdrop-blur">
        <div className="mx-auto grid h-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 text-[11.6875px] uppercase tracking-[0.28em] text-black/65">
          <div className="justify-self-start">
            <Link className="md:hidden hover:text-black" href="/placements">
              Placements
            </Link>
            <div className="hidden items-center md:flex">
              <span>Columbus, (OH)</span>
              <span className="mx-2 inline-block align-middle text-[14.875px] font-semibold leading-none">•</span>
              <ColumbusTime />
            </div>
          </div>

          <Link
            href="/"
            className="group inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <HomeMark className="h-[18px] w-[18px] transition group-hover:scale-[1.04] group-hover:brightness-110" />
          </Link>

          <div className="justify-self-end">
            <Link className="md:hidden hover:text-black" href="/performance">
              Performance
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <Link className="hover:text-black" href="/placements">
                Placements
              </Link>
              <Link className="hover:text-black" href="/performance">
                Performance
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <main className="relative z-[10] mx-auto max-w-6xl px-6 pb-24 pt-16 sm:px-8 lg:px-10 xl:px-12">
        <div className="space-y-16">
          <section aria-label="Project hero" className="border-y border-black/10 bg-white">
            <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-6 py-7 text-center sm:py-8">
              <div className="space-y-6">
                <div className="text-[8.5px] uppercase tracking-[0.28em] text-black/35">{project.year}</div>
                <h1 className="text-balance text-[clamp(21.25px,3vw,44.625px)] font-medium uppercase leading-[1] tracking-[0.02em] text-black">
                  {project.title}
                </h1>
                <div className="text-[clamp(10.625px,1.3vw,17px)] uppercase tracking-[0.18em] text-black/70">
                  {project.subtitle}
                </div>
                <div className="text-[8.5px] uppercase tracking-[0.28em] text-black/45">{project.role}</div>
                <div className="text-[8.5px] uppercase tracking-[0.28em] text-black/40">
                  {project.tags.join(" · ")}
                </div>
              </div>
            </div>
          </section>

          <section aria-label="Summary" className="mx-auto max-w-3xl text-center">
            <div className="text-[9.5625px] uppercase tracking-[0.28em] text-black/50">Summary</div>
            <p className="mt-4 text-[0.9375rem] text-black/70">{project.blurb}</p>
          </section>

          {project.media.length ? (
            <section aria-label="Media" className="space-y-6">
              <div className="text-center text-[9.5625px] uppercase tracking-[0.28em] text-black/50">Media</div>
              <div className="space-y-8">
                {project.media.map((media, idx) => {
                  if (media.kind === "image") {
                    return (
                      <div key={`media-${idx}`} className="overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                        <div className="relative aspect-[4/3] w-full">
                          <Image src={media.src} alt={media.alt} fill sizes="100vw" className="object-cover" />
                        </div>
                        {media.title ? (
                          <div className="border-t border-black/10 bg-white px-5 py-3 text-[10.625px] uppercase tracking-[0.24em] text-black/60">
                            {media.title}
                          </div>
                        ) : null}
                      </div>
                    );
                  }

                  if (media.kind === "audio") {
                    return (
                      <div key={`media-${idx}`} className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                        <iframe
                          src={media.url}
                          title={media.title ?? "Audio"}
                          height={media.height ?? 152}
                          className="w-full border-0"
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                        />
                      </div>
                    );
                  }

                  const src = getVideoEmbedUrl(media);
                  return (
                    <div key={`media-${idx}`} className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                      <div className="relative aspect-video w-full">
                        <iframe
                          src={src}
                          title={media.title ?? "Video"}
                          className="absolute inset-0 h-full w-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          <section aria-label="Streaming links" className="text-center">
            <div className="mx-auto w-full max-w-4xl space-y-6">
              <h2 className="text-[9.5625px] uppercase tracking-[0.28em] text-black/50">The Record</h2>
              <div className="mx-auto w-full max-w-3xl bg-black/[0.04] p-5">
                <div className="space-y-6">
                  {project.links.map((link) => (
                    <div key={link.href} className="border border-black/10 bg-white p-4">
                      <div className="text-[10.625px] uppercase tracking-[0.24em] text-black/70">{link.label}</div>
                      <div className="mt-1.5 text-[10.625px] text-black/60">
                        <a className="hover:text-black" href={link.href} target="_blank" rel="noreferrer">
                          Open Link
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section aria-label="Details" className="grid gap-10 border-t border-black/10 pt-10 md:grid-cols-3">
            <div className="space-y-4">
              <div className="text-[9.5625px] uppercase tracking-[0.28em] text-black/50">Deliverables</div>
              <ul className="space-y-2 text-[0.9375rem] text-black/70">
                {project.deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="text-[9.5625px] uppercase tracking-[0.28em] text-black/50">Credits</div>
              <ul className="space-y-2 text-[0.9375rem] text-black/70">
                {project.credits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <div className="text-[9.5625px] uppercase tracking-[0.28em] text-black/50">Narrative</div>
              <div className="space-y-3 text-[0.9375rem] text-black/70">
                {project.narrative.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-[5]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-[9.5625px] uppercase tracking-[0.28em] text-black/50 sm:px-8 lg:px-10 xl:px-12">
          {prevProject ? (
            <Link className="pointer-events-auto hover:text-black" href={`/placements/${prevProject.slug}`}>
              ← Previous Project
            </Link>
          ) : (
            <span className="text-black/30">← Previous Project</span>
          )}
          {nextProject ? (
            <Link className="pointer-events-auto hover:text-black" href={`/placements/${nextProject.slug}`}>
              Next Project →
            </Link>
          ) : (
            <span className="text-black/30">Next Project →</span>
          )}
        </div>
      </div>
    </div>
  );
}
