"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ColumbusTime from "@/app/components/ColumbusTime";
import HomeMark from "@/app/components/HomeMark";
import { projectIndex } from "@/data/projects.data";

export default function ProjectDetailClient() {
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromPath = window.location.pathname.split("/").filter(Boolean).pop() || null;
    setCurrentSlug(fromPath);
  }, []);

  const artistLabel = "PRIMARY ARTIST";
  const subtitleLabel = "Optional subtitle or track reference";
  const currentIndex = currentSlug ? projectIndex.findIndex((p) => p.slug === currentSlug) : -1;
  const prevProject = currentIndex > 0 ? projectIndex[currentIndex - 1] : null;
  const nextProject =
    currentIndex >= 0 && currentIndex < projectIndex.length - 1 ? projectIndex[currentIndex + 1] : null;

  return (
    <>
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

        <main className="relative z-[10] mx-auto max-w-6xl px-6 pb-0 pt-16 sm:px-8 lg:px-10 xl:px-12">
          <div className="flex h-[calc(100svh-64px)] -translate-y-8 flex-col items-center justify-center gap-20 overflow-y-auto sm:-translate-y-10 sm:overflow-hidden">
            <section aria-label="Project hero" className="w-full translate-y-[3vh] border-y border-black/10 bg-white">
              <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-6 py-7 text-center sm:py-8">
                <div className="space-y-6">
                  <div className="text-[8px] uppercase tracking-[0.28em] text-black/35">YEAR</div>
                  <h1 className="text-balance text-[clamp(20px,3vw,42px)] font-medium uppercase leading-[1] tracking-[0.02em] text-black">
                    PROJECT TITLE
                  </h1>
                  <div className="text-[clamp(10px,1.3vw,16px)] uppercase tracking-[0.18em] text-black/70">
                    {artistLabel}
                  </div>
                  <div className="text-[8px] uppercase tracking-[0.28em] text-black/45">ROLE · ROLE · ROLE</div>
                  <div className="text-[8px] uppercase tracking-[0.28em] text-black/40">{subtitleLabel}</div>
                </div>
              </div>
            </section>

            <section aria-label="Audio" className="w-full text-center">
              <div className="mx-auto w-full max-w-4xl space-y-6">
                <h2 className="text-[9px] uppercase tracking-[0.28em] text-black/50">The Record</h2>
                <div className="mx-auto w-full max-w-3xl bg-black/[0.04] p-5">
                  <div className="space-y-6">
                    {[0, 1].map((idx) => (
                      <div key={`streaming-${idx}`} className="border border-black/10 bg-white p-4">
                        <div className="text-[10px] uppercase tracking-[0.24em] text-black/70">Streaming Service</div>
                        <div className="mt-1.5 text-[10px] text-black/60">
                          <a className="hover:text-black" href="https://example.com" target="_blank" rel="noreferrer">
                            Open Link
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>

        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-[5]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-[9px] uppercase tracking-[0.28em] text-black/50 sm:px-8 lg:px-10 xl:px-12">
            {prevProject ? (
              <Link className="pointer-events-auto hover:text-black" href={`/projects/${prevProject.slug}`}>
                ← Previous Project
              </Link>
            ) : (
              <span className="text-black/30">← Previous Project</span>
            )}
            {nextProject ? (
              <Link className="pointer-events-auto hover:text-black" href={`/projects/${nextProject.slug}`}>
                Next Project →
              </Link>
            ) : (
              <span className="text-black/30">Next Project →</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
