"use client";

import SiteHeader from "../components/SiteHeader";

export default function EPKClient() {
  return (
    <>
      <div className="edge-glow" />
      <SiteHeader />
      <main className="min-h-screen bg-black px-4 pt-20 pb-24 sm:px-6 md:px-8">
        <div className="mx-auto max-w-[800px]">

          {/* ── Demo Reel ─────────────────────────────────────── */}
          <section className="mb-16">
            <h1 className="mb-8 text-center text-[28px] sm:text-[36px] md:text-[44px] font-light tracking-[-0.02em] text-[#F2F2F2]">
              <span>Electronic Press Kit</span>
            </h1>
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
            <p className="mt-4 text-center text-[12px] uppercase tracking-[0.2em] text-white/30">
              <span>Live Drums &bull; Session Drums</span>
            </p>
          </section>

          {/* ── Divider ───────────────────────────────────────── */}
          <div className="mx-auto mb-16 h-px w-24 bg-white/10" />

          {/* ── Bio ───────────────────────────────────────────── */}
          <section className="mb-16">
            <h2 className="mb-8 text-center text-[20px] sm:text-[24px] font-light uppercase tracking-[0.2em] text-[#F2F2F2]">
              <span>Bio</span>
            </h2>
            <div className="space-y-5 text-[15px] sm:text-[16px] leading-[1.8] text-[#BFBFBF]">
              <p>
                Anthony Dake is a drummer, musical director, and sonic architect based in
                Nashville, TN. Raised in Topeka, Kansas, he began learning percussion at age 4
                and was running click, following vocal cues, and managing show flow for
                near-thousand-person worship services by age 10.
              </p>
              <p>
                His competitive marching arts career includes World Class championship ensembles{" "}
                <strong>Blue Knights</strong> (2017\u201318), <strong>Rhythm X</strong>, and{" "}
                <strong>the Bluecoats</strong> (2020), along with <strong>Dojo Percussion</strong>{" "}
                under Dana Murray (Berklee, Wynton Marsalis). He earned his scholarship to{" "}
                <strong>Capital University Conservatory of Music</strong> through{" "}
                <a
                  href="https://www.jazzartsgroup.org/meet-the-cjo/bob-breithaupt/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-white/30 underline-offset-4 hover:decoration-white/60 transition-colors"
                >
                  <strong>Bob Breithaupt</strong>
                </a>
                , longtime Columbus Jazz Orchestra drummer whose students include Matt Billingslea
                (Taylor Swift), Brian Fullen (Shania Twain), and Stephan Fess (Jared Blake).
              </p>
              <p>
                His niche is <strong>acoustic and electronic integration</strong> \u2014 running
                tracks, triggering samples, blending kit and machine across every genre. Recent
                credits include main-stage festival sets at Columbus Pride and ComFest, the
                musical theatre drum chair for <em>Rock of Ages</em> at Short North Stage,
                performances at Ginger Rabbit Jazz Lounge, Brothers Drake, Rambling House, and
                Spacebar, and featured drummer with Louis Pettinelli Entertainment for
                high-profile weddings and corporate events.
              </p>
            </div>
          </section>

          {/* ── Divider ───────────────────────────────────────── */}
          <div className="mx-auto mb-16 h-px w-24 bg-white/10" />

          {/* ── Downloads ─────────────────────────────────────── */}
          <section className="mb-16 text-center">
            <h2 className="mb-8 text-[20px] sm:text-[24px] font-light uppercase tracking-[0.2em] text-[#F2F2F2]">
              <span>Downloads</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/Anthony_Dake_CV.pdf"
                download
                className="epk-cta inline-flex items-center justify-center rounded-full px-8 py-3.5 text-[11px] uppercase tracking-[0.3em] font-semibold"
              >
                <span>CV / Curriculum Vitae</span>
              </a>
              <a
                href="/Anthony_Dake_Resume.pdf"
                download
                className="epk-cta inline-flex items-center justify-center rounded-full px-8 py-3.5 text-[11px] uppercase tracking-[0.3em] font-semibold"
              >
                <span>Resume</span>
              </a>
            </div>
            <p className="mt-4 text-[12px] text-white/30">
              <span>PDF format &bull; Click to download</span>
            </p>
          </section>

          {/* ── Divider ───────────────────────────────────────── */}
          <div className="mx-auto mb-16 h-px w-24 bg-white/10" />

          {/* ── Social Links ──────────────────────────────────── */}
          <section className="mb-16 text-center">
            <h2 className="mb-8 text-[20px] sm:text-[24px] font-light uppercase tracking-[0.2em] text-[#F2F2F2]">
              <span>Connect</span>
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {/* Instagram */}
              <a
                className="group inline-flex h-[62px] w-[62px] items-center justify-center rounded-full border border-white/10 bg-black/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                href="https://www.instagram.com/anthony_dake/"
                target="_blank"
                rel="noreferrer me"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="h-[41px] w-[41px] transition group-hover:brightness-110">
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
                className="group inline-flex h-[62px] w-[62px] items-center justify-center rounded-full border border-white/10 bg-black/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                href="https://www.youtube.com/@anthony_dake"
                target="_blank"
                rel="noreferrer me"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" className="h-[41px] w-[41px] transition group-hover:brightness-110">
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
                className="group inline-flex h-[62px] w-[62px] items-center justify-center rounded-full border border-white/10 bg-black/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                href="https://www.tiktok.com/@anthony_dake"
                target="_blank"
                rel="noreferrer me"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" className="h-[41px] w-[41px] transition group-hover:brightness-110">
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
            </div>
          </section>

          {/* ── Divider ───────────────────────────────────────── */}
          <div className="mx-auto mb-16 h-px w-24 bg-white/10" />

          {/* ── Contact ───────────────────────────────────────── */}
          <section className="text-center pb-8">
            <h2 className="mb-6 text-[20px] sm:text-[24px] font-light uppercase tracking-[0.2em] text-[#F2F2F2]">
              <span>Contact</span>
            </h2>
            <a
              href="mailto:adakemusic@gmail.com"
              className="inline-flex items-center gap-3 text-[16px] sm:text-[18px] text-[#8EC5FF] hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0">
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
              <span>adakemusic@gmail.com</span>
            </a>
            <p className="mt-6 text-[12px] uppercase tracking-[0.24em] text-white/25">
              <span>Nashville, TN</span>
            </p>
          </section>

        </div>
      </main>
    </>
  );
}
