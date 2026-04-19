"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import SiteHeader from "../components/SiteHeader";

const SERVICES = [
  "Production",
  "Session Drums",
  "Songwriting",
  "Mixing / Mastering",
  "Musical Direction",
  "Other",
] as const;

type FormData = {
  name: string;
  email: string;
  service: string;
  description: string;
  timeline: string;
  musicLink: string;
};

export default function BookClient() {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    service: "",
    description: "",
    timeline: "",
    musicLink: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const update = (field: keyof FormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#111113] pt-14">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <p className="text-[11px] uppercase tracking-[0.35em] text-black/50">
            Work With Me
          </p>
          <h1 className="mt-3 text-3xl tracking-[0.06em] text-black sm:text-4xl">
            Book a Session
          </h1>
          <p className="mt-4 max-w-lg text-[15px] leading-7 text-black/60">
            Tell me about your project and I&apos;ll get back to you within 24
            hours. Or skip straight to a free 15-minute discovery call below.
          </p>

          {status === "sent" ? (
            <div className="mt-12 space-y-4">
              <h2 className="text-2xl tracking-[0.04em] text-black">
                Got it — I&apos;ll be in touch.
              </h2>
              <p className="text-[15px] leading-7 text-black/60">
                Check your inbox for a confirmation. In the meantime, feel free
                to browse{" "}
                <Link href="/placements" className="underline hover:text-black">
                  my work
                </Link>
                .
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-12 space-y-8">
              <div className="space-y-6">
                <Field label="Name" required>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Your name"
                    className="form-input"
                  />
                </Field>

                <Field label="Email" required>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@email.com"
                    className="form-input"
                  />
                </Field>

                <Field label="Service">
                  <select
                    value={form.service}
                    onChange={(e) => update("service", e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select a service</option>
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Project Description">
                  <textarea
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Tell me about your project — genre, vibe, references, what you need..."
                    rows={4}
                    className="form-input resize-none"
                  />
                </Field>

                <Field label="Timeline">
                  <input
                    type="text"
                    value={form.timeline}
                    onChange={(e) => update("timeline", e.target.value)}
                    placeholder="e.g. Need it by March, flexible, ASAP"
                    className="form-input"
                  />
                </Field>

                <Field label="Link to Your Music">
                  <input
                    type="url"
                    value={form.musicLink}
                    onChange={(e) => update("musicLink", e.target.value)}
                    placeholder="Spotify, SoundCloud, YouTube, etc."
                    className="form-input"
                  />
                </Field>
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="book-session-cta inline-flex items-center justify-center rounded-full px-8 py-3.5 text-[11px] uppercase tracking-[0.3em] font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
              >
                {status === "sending" ? "Sending..." : "Submit"}
              </button>

              {status === "error" && (
                <p className="text-[13px] text-red-400">
                  Something went wrong. Please try again or email me directly at{" "}
                  <a
                    href="mailto:adakemusic@gmail.com"
                    className="underline"
                  >
                    adakemusic@gmail.com
                  </a>
                  .
                </p>
              )}
            </form>
          )}

          {/* Cal.com discovery call section */}
          <div className="mt-20 border-t border-white/10 pt-12">
            <h2 className="text-2xl tracking-[0.04em] text-black">
              Prefer to talk first?
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/60">
              Book a free 15-minute discovery call to talk through your project
              before committing to anything.
            </p>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <p className="text-[13px] text-black/50">
                Calendar scheduling coming soon — email{" "}
                <a
                  href="mailto:adakemusic@gmail.com"
                  className="underline hover:text-black"
                >
                  adakemusic@gmail.com
                </a>{" "}
                to book a call in the meantime.
              </p>
              {/* Replace with Cal.com embed once Anthony sets up his account:
              <iframe
                src="https://cal.com/anthonydake/discovery"
                className="h-[600px] w-full rounded-xl border-0"
                title="Book a discovery call"
              /> */}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] uppercase tracking-[0.3em] text-black/50">
        {label}
        {required && <span className="ml-1 text-blue-400">*</span>}
      </span>
      {children}
    </label>
  );
}
