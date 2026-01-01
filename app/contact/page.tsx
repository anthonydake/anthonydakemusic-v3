"use client"

import { useState } from "react"

export default function Page() {
  const [status, setStatus] = useState<string>("")

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd.entries())

    const subject = encodeURIComponent(`Project Inquiry — ${data.name || "Unknown"}`)
    const body = encodeURIComponent(
      [
        `Name: ${data.name || ""}`,
        `Email: ${data.email || ""}`,
        `Budget Range: ${data.budget || ""}`,
        `Timeline: ${data.timeline || ""}`,
        `Links: ${data.links || ""}`,
        ``,
        `Project Details:`,
        `${data.details || ""}`,
      ].join("\n")
    )

    // Works immediately without any backend setup
    window.location.href = `mailto:booking@anthonydakemusic.com?subject=${subject}&body=${body}`
    setStatus("Opening your email client…")
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
        Send the details once and I’ll reply with next steps and availability.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <input name="name" placeholder="Your name" className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5" required />
        <input name="email" placeholder="Your email" className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5" required />
        <input name="budget" placeholder="Budget range (optional)" className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5" />
        <input name="timeline" placeholder="Timeline (optional)" className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5" />
        <input name="links" placeholder="Links (music, references, socials)" className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5" />
        <textarea name="details" placeholder="Describe the project: sound, goals, deliverables, notes" rows={6} className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5" required />

        <button className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
          Send inquiry
        </button>

        {status && <div className="text-xs text-zinc-500 dark:text-zinc-400">{status}</div>}
      </form>
    </main>
  )
}
