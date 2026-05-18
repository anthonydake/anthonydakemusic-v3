"use client";

import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-white/10 bg-black px-6 py-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] uppercase tracking-widest text-white/40">
        <div className="flex items-center gap-6">
          <Link href="/placements" className="hover:text-white/70 transition-colors">
            <span>Placements</span>
          </Link>
          <Link href="/performance" className="hover:text-white/70 transition-colors">
            <span>Performance</span>
          </Link>
          <Link href="/practice" className="hover:text-white/70 transition-colors">
            <span>Practice</span>
          </Link>
          <Link href="/epk" className="hover:text-white/70 transition-colors">
            <span>EPK</span>
          </Link>
          <Link href="/about" className="hover:text-white/70 transition-colors">
            <span>About</span>
          </Link>
        </div>
        <div className="flex flex-col items-center gap-1 sm:items-end">
          <span className="text-[10px] tracking-[0.22em] text-white/55">
            currently booking — 2026
          </span>
          <div className="flex items-center gap-4">
            <a href="mailto:adakemusic@gmail.com" className="hover:text-white/70 transition-colors">
              <span>adakemusic@gmail.com</span>
            </a>
            <span className="text-white/20">·</span>
            <span>Columbus, OH</span>
          </div>
        </div>
        <span className="text-white/25">© {year} Anthony Dake</span>
      </div>
    </footer>
  );
}
