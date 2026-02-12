"use client";

import Link from "next/link";
import ColumbusTime from "../components/ColumbusTime";

export default function AboutPageClient() {
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
            className="group inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 48 48"
              className="h-4 w-4 text-[#F2F2F2] transition group-hover:scale-[1.03]"
            >
              <line x1="8" y1="24" x2="40" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            </svg>
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
      <main className="min-h-screen bg-white px-6 pb-20 pt-24 text-black">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-12 text-center min-h-[calc(100svh-96px)]">
          <div className="space-y-2 text-[12px] uppercase tracking-[0.28em] text-black/60">
            <div>📍 Columbus, Ohio — Anthony Dake</div>
            <div>🎵 Music producer • drummer • music director</div>
            <div>💼 Book: adakemusic@gmail.com</div>
            <div>📲 Follow @anthony_dake</div>
            <div>🎬 New content weekly</div>
          </div>
          <div className="flex items-center gap-8 sm:gap-10">
            <a
              className="group inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              href="https://www.instagram.com/anthony_dake/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/70 transition group-hover:text-black">
                <rect x="4" y="4" width="16" height="16" rx="4" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="17" cy="7" r="1" fill="currentColor" />
              </svg>
            </a>
            <a
              className="group inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              href="https://www.youtube.com/@anthony_dake"
              target="_blank"
              rel="noreferrer"
              aria-label="YouTube"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/70 transition group-hover:text-black">
                <rect x="3.5" y="7" width="17" height="10" rx="3" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <polygon points="11,9.5 15,12 11,14.5" fill="currentColor" />
              </svg>
            </a>
            <a
              className="group inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              href="https://www.tiktok.com/@anthony_dake"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-black/70 transition group-hover:text-black">
                <path
                  d="M14 5v8.2a3.2 3.2 0 1 1-2-3V7.2c0-.5.4-.9.9-.9h1.1z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 6.2c.9 1.2 2.1 1.9 3.6 2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
