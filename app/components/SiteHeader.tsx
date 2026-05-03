"use client";

import Link from "next/link";
import NashvilleTime from "./NashvilleTime";
import HomeMark from "./HomeMark";

export default function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-[9999] isolate h-14 bg-black/70 backdrop-blur">
      <div className="mx-auto grid h-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 text-[12px] uppercase tracking-[0.28em] text-white/65">
        <div className="justify-self-start">
          <Link className="md:hidden hover:text-white py-3" href="/placements">
            Placements
          </Link>
          <div className="hidden items-center md:flex">
            <span>Nashville, (TN)</span>
            <span className="mx-2 inline-block align-middle text-[14.875px] font-semibold leading-none">•</span>
            <NashvilleTime />
          </div>
        </div>
        <Link
          href="/"
          className="home-nav group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <HomeMark />
        </Link>
        <div className="justify-self-end">
          <div className="flex items-center gap-4 md:hidden">
            <Link className="hover:text-white py-3" href="/performance">
              Performance
            </Link>
            
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link className="hover:text-white py-3" href="/placements">
              Placements
            </Link>
            <Link className="hover:text-white py-3" href="/performance">
              Performance
            </Link>
            <Link className="hover:text-white py-3" href="/about">
              About
            </Link>
            
          </nav>
        </div>
      </div>
    </header>
  );
}
