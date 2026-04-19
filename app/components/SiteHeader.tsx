"use client";

import Link from "next/link";
import ColumbusTime from "./ColumbusTime";
import HomeMark from "./HomeMark";

export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-[9999] isolate h-14 bg-white/70 backdrop-blur">
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
          <div className="flex items-center gap-4 md:hidden">
            <Link className="hover:text-black" href="/performance">
              Performance
            </Link>
            <Link
              href="/book"
              className="book-session-cta inline-flex items-center rounded-full bg-white px-3 py-1 text-[10px] font-semibold tracking-[0.2em] text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Book
            </Link>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link className="hover:text-black" href="/placements">
              Placements
            </Link>
            <Link className="hover:text-black" href="/performance">
              Performance
            </Link>
            <Link className="hover:text-black" href="/about">
              About
            </Link>
            <Link
              href="/book"
              className="book-session-cta inline-flex items-center rounded-full bg-white px-4 py-1.5 text-[10.5px] font-semibold tracking-[0.2em] text-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Book a Session
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
