"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import ColumbusTime from "../components/ColumbusTime";
import HomeMark from "../components/HomeMark";
import site from "@/content/site";

export default function ContactPageClient() {
  const [status, setStatus] = useState<string>("");
  const services = site.contact.services;
  const [service, setService] = useState<string>(services[0] ?? "Other");

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

    window.location.href = `mailto:${site.contact.email}?subject=${subject}&body=${body}`;
    setStatus(`Opening your email client... If it doesn't open, email ${site.contact.email}.`);
    form.reset();
    setService(services[0] ?? "Other");
  }

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[9999] isolate h-14 bg-white/70 backdrop-blur">
        <div className="mx-auto grid h-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 text-[11px] uppercase tracking-[0.28em] text-black/65">
          <div className="justify-self-start">
            <span>Columbus, (OH)</span>
            <span className="mx-2 inline-block align-middle text-[14px] font-semibold leading-none">•</span>
            <ColumbusTime />
          </div>
          <Link
            href="/"
            className="group inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:-translate-y-0.5"
          >
            <HomeMark className="h-[18px] w-[18px] transition group-hover:scale-[1.04] group-hover:brightness-110" />
          </Link>
          <nav className="flex items-center justify-self-end gap-6">
            <Link className="hover:text-black" href="/projects">
              Projects
            </Link>
            <Link className="hover:text-black" href="/contact">
              Contact
            </Link>
            <Link className="hover:text-black" href="/performance">
              Performance
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
              This form captures everything I need to scope production, drums, or music direction quickly. Attach links to references,
              demos, or Dropbox/Drive folders. {site.contact.responseTime}
            </p>
          </header>

          <form onSubmit={onSubmit} className="grid gap-5 rounded-[32px] border border-black/10 bg-white p-6 shadow-xl sm:p-8">
            <input name="company" className="hidden" tabIndex={-1} aria-hidden />
            <input type="hidden" name="service" value={service} />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="name" label={labelFor("name")} placeholder={placeholderFor("name")} required={requiredFor("name")} />
              <Field
                name="email"
                type={typeFor("email")}
                label={labelFor("email")}
                placeholder={placeholderFor("email")}
                required={requiredFor("email")}
              />
              <Field
                name="phone"
                type={typeFor("phone")}
                label={labelFor("phone")}
                placeholder={placeholderFor("phone")}
                required={requiredFor("phone")}
              />
              <Field
                name="artist"
                label={labelFor("artist")}
                placeholder={placeholderFor("artist")}
                required={requiredFor("artist")}
              />
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
              <Field
                name="timeline"
                label={labelFor("timeline")}
                placeholder={placeholderFor("timeline")}
                required={requiredFor("timeline")}
              />
              <Field
                name="budget"
                label={labelFor("budget")}
                placeholder={placeholderFor("budget")}
                required={requiredFor("budget")}
              />
            </div>

            <div className="grid gap-4">
              <Field
                name="links"
                label={labelFor("links")}
                placeholder={placeholderFor("links")}
                required={requiredFor("links")}
              />
              <Field
                name="source"
                label={labelFor("source")}
                placeholder={placeholderFor("source")}
                required={requiredFor("source")}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium text-black/70">{labelFor("details")}</label>
                <textarea
                  name="details"
                  required={requiredFor("details")}
                  rows={rowsFor("details")}
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-black/60"
                  placeholder={placeholderFor("details")}
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
                <a className="underline underline-offset-4" href={`mailto:${site.contact.email}`}>
                  {site.contact.email}
                </a>
              </p>
            </div>

            {status && <div className="text-xs text-black/60">{status}</div>}
          </form>
        </div>
      </main>
    </>
  );

  function fieldByName(name: (typeof site.contact.fields)[number]["name"]) {
    return site.contact.fields.find((f) => f.name === name);
  }

  function labelFor(name: (typeof site.contact.fields)[number]["name"]) {
    return fieldByName(name)?.label ?? name;
  }

  function placeholderFor(name: (typeof site.contact.fields)[number]["name"]) {
    return fieldByName(name)?.placeholder ?? "";
  }

  function requiredFor(name: (typeof site.contact.fields)[number]["name"]) {
    const f = fieldByName(name);
    return Boolean(f && "required" in f && f.required);
  }

  function typeFor(
    name: Exclude<(typeof site.contact.fields)[number]["name"], "details">
  ): "text" | "email" | "tel" {
    const f = fieldByName(name);
    if (f && "type" in f && f.type) return f.type;
    return "text";
  }

  function rowsFor(name: "details") {
    const f = fieldByName(name);
    if (f && "kind" in f && f.kind === "textarea" && typeof f.rows === "number") return f.rows;
    return 6;
  }
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
