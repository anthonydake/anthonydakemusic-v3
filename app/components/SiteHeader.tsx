"use client";

import { useState } from "react";
import Link from "next/link";
import ColumbusTime from "./ColumbusTime";
import HomeMark from "./HomeMark";
import BookingModal from "./BookingModal";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const openBooking = () => {
    setMenuOpen(false);
    setBookingOpen(true);
  };

  return (
    <>
      <a
        href="#main-content"
        className="skip-to-content"
      >
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-[9999] isolate h-14 bg-black/70 backdrop-blur">
        <div className="mx-auto grid h-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 text-[12px] uppercase tracking-[0.28em] text-white/65">
          <div className="justify-self-start">
            {/* Mobile: hamburger button */}
            <button
              className="md:hidden inline-flex h-11 w-11 items-center justify-center"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                {menuOpen ? (
                  <>
                    <line x1="4" y1="4" x2="16" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="16" y1="4" x2="4" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
            {/* Desktop: location + time */}
            <div className="hidden items-center md:flex">
              <span>Columbus, (OH)</span>
              <span className="mx-2 inline-block align-middle text-[14.875px] font-semibold leading-none">•</span>
              <ColumbusTime />
            </div>
          </div>
          <Link
            href="/"
            className="home-nav group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <HomeMark />
          </Link>
          <div className="justify-self-end">
            {/* Desktop nav */}
            <nav className="hidden items-center gap-6 md:flex">
              <Link className="hover:text-white py-3" href="/placements">
                Placements
              </Link>
              <Link className="hover:text-white py-3" href="/performance">
                Performance
              </Link>
              <Link className="hover:text-white py-3" href="/practice">
                Practice
              </Link>
              <Link className="hover:text-white py-3" href="/about">
                About
              </Link>
              <button
                type="button"
                onClick={openBooking}
                className="ml-2 rounded-full border border-white/20 px-5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                Book →
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/90 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <nav
            className="mt-14 flex flex-col items-center gap-1 px-6 pt-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              className="w-full text-center py-4 text-[14px] uppercase tracking-[0.28em] text-white/70 hover:text-white transition-colors"
              href="/placements"
              onClick={() => setMenuOpen(false)}
            >
              Placements
            </Link>
            <Link
              className="w-full text-center py-4 text-[14px] uppercase tracking-[0.28em] text-white/70 hover:text-white transition-colors"
              href="/performance"
              onClick={() => setMenuOpen(false)}
            >
              Performance
            </Link>
            <Link
              className="w-full text-center py-4 text-[14px] uppercase tracking-[0.28em] text-white/70 hover:text-white transition-colors"
              href="/practice"
              onClick={() => setMenuOpen(false)}
            >
              Practice
            </Link>
            <Link
              className="w-full text-center py-4 text-[14px] uppercase tracking-[0.28em] text-white/70 hover:text-white transition-colors"
              href="/about"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            <button
              type="button"
              onClick={openBooking}
              className="mt-4 w-full rounded-full border border-white/30 py-3 text-[13px] uppercase tracking-[0.28em] text-white/90 transition-colors hover:bg-white/10 hover:text-white"
            >
              Book →
            </button>
          </nav>
        </div>
      )}

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
