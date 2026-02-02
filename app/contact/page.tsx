"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import TextScramble from "../components/TextScramble";

const services = ["Production", "Session Drums", "Music Direction", "Playback Systems", "Other"];

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
  const [status, setStatus] = useState<string>("");
  const [service, setService] = useState<string>(services[0]);
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

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Simple honeypot to limit bots
    const hidden = (fd.get("company") as string) || "";
    if (hidden.trim().length > 0) {
      setStatus("Spam check failed. Please try again or email directly.");
      return;
    }

    const data = Object.fromEntries(fd.entries());

    const subject = encodeURIComponent(`Project Inquiry — ${data.name || "Unknown"}`);
    const body = encodeURIComponent(
      [
        `Name: ${data.name || ""}`,
        `Email: ${data.email || ""}`,
        `Phone: ${data.phone || ""}`,
        `Artist/Band: ${data.artist || ""}`,
        `Service: ${data.service || service}`,
        `Budget Range: ${data.budget || ""}`,
        `Timeline / Deadline: ${data.timeline || ""}`,
        `Links: ${data.links || ""}`,
        `Found via: ${data.source || ""}`,
        ``,
        `Project Description:`,
        `${data.details || ""}`,
      ].join("\n")
    );

    window.location.href = `mailto:booking@anthonydakemusic.com?subject=${subject}&body=${body}`;
    setStatus("Opening your email client... If it doesn't open, email booking@anthonydakemusic.com.");
    form.reset();
    setService(services[0]);
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
      <main className="min-h-screen bg-white px-6 pb-20 pt-20 text-black">
        <div className="mx-auto max-w-4xl space-y-8">
          <header className="space-y-3">
            <p className="text-xs uppercase tracking-[0.32em] text-black/50">Contact</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Tell me about the project once. I&apos;ll reply with availability and a plan.
          </h1>
          <p className="max-w-2xl text-sm text-black/65">
            This form captures everything I need to scope production, drums, or music direction quickly. Attach links
            to references, demos, or Dropbox/Drive folders.
          </p>
        </header>

        <form onSubmit={onSubmit} className="grid gap-5 rounded-[32px] border border-black/10 bg-white p-6 shadow-xl sm:p-8">
          <input name="company" className="hidden" tabIndex={-1} aria-hidden />
          <input type="hidden" name="service" value={service} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="name" label="Name" placeholder="Your name" required />
            <Field name="email" type="email" label="Email" placeholder="you@email.com" required />
            <Field name="phone" label="Phone (optional)" placeholder="+1 (---) --- ----" />
            <Field name="artist" label="Artist / Band" placeholder="If applicable" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-black/70">What do you need?</label>
            <div className="flex flex-wrap gap-2">
              {services.map((s) => {
                const active = service === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setService(s)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-black bg-black text-white shadow-md"
                        : "border-black/15 bg-white text-black hover:border-black/40"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="timeline" label="Timeline / deadline" placeholder="e.g., Master by May 12" />
            <Field name="budget" label="Budget range" placeholder="$" />
          </div>

          <div className="grid gap-4">
            <Field
              name="links"
              label="Links (references, demos, Dropbox/Drive, stems)"
              placeholder="Paste URLs"
            />
            <Field name="source" label="Where did you find me?" placeholder="Referral, social, show, etc." />
            <div className="space-y-2">
              <label className="text-sm font-medium text-black/70">Project description</label>
              <textarea
                name="details"
                required
                rows={6}
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black/60"
                placeholder="What you're building, roles needed, references, deliverables, non-negotiables."
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Send inquiry
            </button>
            <p className="text-xs text-black/60">
              Direct email:{" "}
              <a className="underline underline-offset-4" href="mailto:booking@anthonydakemusic.com">
                booking@anthonydakemusic.com
              </a>
            </p>
          </div>

          {status && <div className="text-xs text-black/60">{status}</div>}
        </form>
      </div>
      </main>
    </>
  );
}

function Field({
  name,
  label,
  placeholder,
  required,
  type = "text",
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-black/70" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black/60"
      />
    </div>
  );
}
