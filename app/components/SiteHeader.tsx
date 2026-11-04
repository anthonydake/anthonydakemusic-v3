"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HomeMark from "./HomeMark";
import BookingModal from "./BookingModal";
import { OPEN_BOOKING_EVENT } from "@/lib/booking";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const openBooking = () => {
    setMenuOpen(false);
    setBookingOpen(true);
  };

  useEffect(() => {
    const onOpen = () => {
      setMenuOpen(false);
      setBookingOpen(true);
    };
    window.addEventListener(OPEN_BOOKING_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_BOOKING_EVENT, onOpen);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[9999] isolate h-14 bg-black/70 backdrop-blur">
        <div className="mx-auto grid h-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 text-[12px] uppercase tracking-[0.18em] text-[#9A9A9A]">
          <div className="justify-self-start">
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
            <nav className="hidden items-center gap-8 md:flex">
              <Link className="py-3 hover:text-[#F2F2F2] transition-colors" href="/placements">
                Placements
              </Link>
              <Link className="py-3 hover:text-[#F2F2F2] transition-colors" href="/performance">
                Performance
              </Link>
            </nav>
          </div>
          <Link
            href="/"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black transition-colors hover:border-white/20"
          >
            <HomeMark />
          </Link>
          <div className="justify-self-end">
            <button
              type="button"
              onClick={openBooking}
              className="md:hidden inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[#9A9A9A] transition-colors hover:text-[#F2F2F2]"
            >
              Book →
            </button>
            <nav className="hidden items-center gap-8 md:flex">
              <Link className="py-3 hover:text-[#F2F2F2] transition-colors" href="/about">
                About
              </Link>
              <button
                type="button"
                onClick={openBooking}
                className="ml-2 rounded-full border border-white/20 px-5 py-1.5 text-[11px] uppercase tracking-[0.18em] text-[#9A9A9A] transition-colors hover:text-[#F2F2F2]"
              >
                Book →
              </button>
            </nav>
          </div>
        </div>
      </header>

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
              className="w-full py-4 text-center text-[14px] uppercase tracking-[0.18em] text-[#9A9A9A] hover:text-[#F2F2F2] transition-colors"
              href="/placements"
              onClick={() => setMenuOpen(false)}
            >
              Placements
            </Link>
            <Link
              className="w-full py-4 text-center text-[14px] uppercase tracking-[0.18em] text-[#9A9A9A] hover:text-[#F2F2F2] transition-colors"
              href="/performance"
              onClick={() => setMenuOpen(false)}
            >
              Performance
            </Link>
            <Link
              className="w-full py-4 text-center text-[14px] uppercase tracking-[0.18em] text-[#9A9A9A] hover:text-[#F2F2F2] transition-colors"
              href="/about"
              onClick={() => setMenuOpen(false)}
            >
              About
            </Link>
            <button
              type="button"
              onClick={openBooking}
              className="mt-4 w-full rounded-full border border-white/30 py-3 text-[13px] uppercase tracking-[0.18em] text-[#F2F2F2] transition-colors hover:border-white/50"
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
