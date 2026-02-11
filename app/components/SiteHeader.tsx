"use client";

import Link from "next/link";
import ColumbusTime from "./ColumbusTime";

export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-[9999] isolate h-14 bg-white/70 backdrop-blur">
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
          <MusicMark />
        </Link>
        <nav className="flex items-center justify-self-end gap-6">
          <Link className="hover:text-black" href="/projects">
            Projects
          </Link>
          <Link className="hover:text-black" href="/performance">
            Performance
          </Link>
          <Link className="hover:text-black" href="/socials">
            Socials
          </Link>
        </nav>
      </div>
    </header>
  );
}

function MusicMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className="h-4 w-4 text-[#F2F2F2] transition group-hover:scale-[1.03]"
    >
      <line x1="8" y1="24" x2="40" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}
