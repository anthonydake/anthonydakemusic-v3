"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import TextScramble from "../components/TextScramble";
import site from "@/content/site";

function formatColumbusTime(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return fmt.format(d);
}

export default function Page() {
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
            <Link className="hover:text-black" href={site.hero.cta.href}>
              {site.hero.cta.label}
            </Link>
            <Link className="hover:text-black" href="/about">
              About
            </Link>
          </nav>
        </div>
      </div>
      <main className="min-h-screen bg-white px-6 pb-20 pt-20 text-black">
        <div className="mx-auto max-w-4xl space-y-12">
          <header className="space-y-3">
            <p className="text-xs uppercase tracking-[0.32em] text-black/50">About</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Services</h1>
            <p className="max-w-2xl text-sm text-black/65">
              {site.hero.subheadline}
            </p>
          </header>

          <section className="grid gap-6">
            {site.services.map((s) => (
              <div key={s.title} className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
                <div className="text-[11px] uppercase tracking-[0.28em] text-black/70">{s.title}</div>
                <ul className="mt-4 space-y-2 text-sm text-black/70">
                  {s.bullets.map((b) => (
                    <li key={b} className="leading-6">
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 grid gap-2 text-xs uppercase tracking-[0.24em] text-black/55 sm:grid-cols-2">
                  <div>
                    <span className="text-black/50">Timeline</span>
                    <div className="mt-1 normal-case tracking-normal text-black/65">{s.timeline}</div>
                  </div>
                  <div>
                    <span className="text-black/50">Revisions</span>
                    <div className="mt-1 normal-case tracking-normal text-black/65">{s.revisions}</div>
                  </div>
                </div>
                {(s as { startingPrice?: string }).startingPrice ? (
                  <div className="mt-4 text-xs uppercase tracking-[0.24em] text-black/55">
                    <span className="text-black/50">Starting</span>{" "}
                    <span className="normal-case tracking-normal text-black/65">
                      {(s as { startingPrice?: string }).startingPrice}
                    </span>
                  </div>
                ) : null}
              </div>
            ))}
          </section>

          {site.testimonials.length > 0 ? (
            <section className="space-y-4">
              <div className="text-xs uppercase tracking-[0.32em] text-black/50">Testimonials</div>
              <div className="grid gap-6">
                {site.testimonials.map((t) => (
                  <figure key={`${t.name}-${t.quote}`} className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm">
                    <blockquote className="text-sm leading-7 text-black/70">“{t.quote}”</blockquote>
                    <figcaption className="mt-4 text-[11px] uppercase tracking-[0.28em] text-black/55">
                      {t.name} — {t.title}
                      {t.project ? <span className="text-black/45"> • {t.project}</span> : null}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          <section className="pt-2">
            <Link
              href={site.hero.cta.href}
              className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              {site.hero.cta.label}
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
