"use client";

import SiteHeader from "../components/SiteHeader";

export default function EPKClient() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 pt-14 pb-8">
        <div className="mx-auto w-full max-w-[800px] flex flex-col items-center">

          {/* ── Resume Download Button (top) ─────────────────── */}
          <div className="mb-4 text-center">
            <a
              href="/Anthony_Dake_Resume.pdf"
              download
              className="epk-cta inline-flex items-center justify-center rounded-full px-14 py-5 text-[15px] uppercase tracking-[0.3em] font-semibold"
            >
              <span>Resume</span>
            </a>
            <p className="mt-2 text-[9px] uppercase tracking-[0.14em] text-white/20">
              <span>PDF format &bull; Click to download</span>
            </p>
          </div>

          {/* ── Demo Reel ────────────────────────────── */}
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-[#111] border border-white/10 shadow-2xl">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/gwNaFJyhTXo?rel=0&modestbranding=1&color=white"
              title="Anthony Dake — Demo Reel"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>

          {/* ── Connect + Contact (condensed below video) ──── */}
          <div className="mt-6 flex flex-col items-center gap-4">
            {/* Social icons row */}
            <div className="flex items-center gap-5">
              {/* Instagram */}
              <a
                className="group inline-flex h-[50px] w-[50px] items-center justify-center rounded-full border border-white/10 bg-black/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                href="https://www.instagram.com/anthony_dake/"
                target="_blank"
                rel="noreferrer me"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="h-[32px] w-[32px] transition group-hover:brightness-110">
                  <defs>
                    <linearGradient id="epkGradIG" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="60%" stopColor="#8EC5FF" />
                      <stop offset="100%" stopColor="#FFFFFF" />
                    </linearGradient>
                  </defs>
                  <rect x="4" y="4" width="16" height="16" rx="4" ry="4" fill="none" stroke="url(#epkGradIG)" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="4" fill="none" stroke="url(#epkGradIG)" strokeWidth="1.5" />
                  <circle cx="17" cy="7" r="1" fill="url(#epkGradIG)" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                className="group inline-flex h-[50px] w-[50px] items-center justify-center rounded-full border border-white/10 bg-black/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                href="https://www.youtube.com/@anthony_dake"
                target="_blank"
                rel="noreferrer me"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" className="h-[32px] w-[32px] transition group-hover:brightness-110">
                  <defs>
                    <linearGradient id="epkGradYT" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="60%" stopColor="#8EC5FF" />
                      <stop offset="100%" stopColor="#FFFFFF" />
                    </linearGradient>
                  </defs>
                  <rect x="3.5" y="7" width="17" height="10" rx="3" ry="3" fill="none" stroke="url(#epkGradYT)" strokeWidth="1.5" />
                  <polygon points="11,9.5 15,12 11,14.5" fill="url(#epkGradYT)" />
                </svg>
              </a>

              {/* TikTok */}
              <a
                className="group inline-flex h-[50px] w-[50px] items-center justify-center rounded-full border border-white/10 bg-black/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                href="https://www.tiktok.com/@anthony_dake"
                target="_blank"
                rel="noreferrer me"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" className="h-[32px] w-[32px] transition group-hover:brightness-110">
                  <defs>
                    <linearGradient id="epkGradTT" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="60%" stopColor="#8EC5FF" />
                      <stop offset="100%" stopColor="#FFFFFF" />
                    </linearGradient>
                  </defs>
                  <path d="M12.3 5.1v7.7l-1.6 1" fill="none" stroke="url(#epkGradTT)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12.3 6.2c1.1 1.5 2.6 2.3 4.6 2.5" fill="none" stroke="url(#epkGradTT)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="9.6" cy="16" r="2.9" fill="none" stroke="url(#epkGradTT)" strokeWidth="1.7" />
                </svg>
              </a>

              {/* Email */}
              <a
                className="group inline-flex h-[50px] w-[50px] items-center justify-center rounded-full border border-white/10 bg-black/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                href="mailto:adakemusic@gmail.com"
                aria-label="Email"
              >
                <svg viewBox="0 0 24 24" className="h-[32px] w-[32px] transition group-hover:brightness-110">
                  <defs>
                    <linearGradient id="epkGradMail" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="60%" stopColor="#8EC5FF" />
                      <stop offset="100%" stopColor="#FFFFFF" />
                    </linearGradient>
                  </defs>
                  <path d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" fill="none" stroke="url(#epkGradMail)" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M22 8 12 13 2 8" fill="none" stroke="url(#epkGradMail)" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            {/* Contact line */}
            <p className="text-[12px] uppercase tracking-[0.2em] text-white/30">
              <span>adakemusic@gmail.com &bull; Columbus, OH</span>
            </p>
          </div>

        </div>
      </main>
    </>
  );
}
