"use client";

import Link from "next/link";
import ColumbusTime from "./ColumbusTime";
import HomeMark from "./HomeMark";

export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-[9999] isolate h-14 bg-white/70 backdrop-blur">
      <div className="mx-auto grid h-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 text-[13.75px] uppercase tracking-[0.28em] text-black/65">
        <div className="justify-self-start">
          <span>Columbus, (OH)</span>
          <span className="mx-2 inline-block align-middle text-[17.5px] font-semibold leading-none">•</span>
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
    </header>
  );
}
