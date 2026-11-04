"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import LogoArchitectOfSound from "./LogoArchitectOfSound";
import TextScramble from "./TextScramble";
import AudioShowcase from "./AudioShowcase";
import { projectIndex } from "../../data/projects.data";
import { STATS } from "../../data/stats";

// Hero reel. Set to the public Vercel Blob URL of an H.264 .mp4 (muted, ~8–15s loop, ≤ ~6MB) to activate.
// Upload with: npm run upload-media -- <local-file> hero/<name>.mp4   (see CLAUDE.md → Media assets)
// PLACEHOLDER — center crop of a practice clip. Replace with the real hero reel.
const HERO_VIDEO_URL: string | null = "https://s4sgra2uircghynp.public.blob.vercel-storage.com/hero/placeholder-reel.mp4";
const HERO_VIDEO_POSTER = "/anthony-dake-drums.jpg";

type HomeClientProps = {
  initialSection?: "hero" | "services" | "epk";
  onOpenBooking?: () => void;
};

const FEATURED_PLACEMENTS = [
  { artist: "AR!YAH", title: "Aura" },
  { artist: "Madelyn Leona", title: "Back & Forth" },
  { artist: "Jae Esquire", title: "Get Down" },
  { artist: "KJ The Cool Nerd", title: "Heartbreaker" },
  { artist: "KJ The Cool Nerd", title: "Pray For Me" },
];

export default function HomeClient({
  initialSection = "hero",
  onOpenBooking,
}: HomeClientProps) {
  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const [visible, setVisible] = useState<{ hero: boolean; services: boolean; epk: boolean }>(() =>
    reduceMotion
      ? { hero: true, services: true, epk: true }
      : { hero: false, services: false, epk: false }
  );
  const [scrambleRun, setScrambleRun] = useState(0);
  const [showHeroVideo, setShowHeroVideo] = useState(false);
  const retriggerScramble = () => setScrambleRun((n) => n + 1);
  const heroRef = useRef<HTMLElement | null>(null);
  const servicesRef = useRef<HTMLElement | null>(null);
  const epkRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (initialSection === "hero") return;
    const target =
      initialSection === "epk" ? epkRef.current : initialSection === "services" ? servicesRef.current : null;
    if (!target) return;
    target.scrollIntoView({ block: "start", behavior: "auto" });
  }, [initialSection]);

  useEffect(() => {
    if (reduceMotion) return;

    const sections: Array<"hero" | "services" | "epk"> = ["hero", "services", "epk"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-id");
          if (!id) return;
          if (!entry.isIntersecting) return;
          if (entry.intersectionRatio < 0.35) return;
          const key = id as "hero" | "services" | "epk";
          if (!sections.includes(key)) return;
          setVisible((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
        });
      },
      { root: null, threshold: [0.1, 0.35, 0.6] }
    );

    const nodes = document.querySelectorAll("[data-snap-section]");
    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    if (!HERO_VIDEO_URL) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShowHeroVideo(true);
  }, []);

  return (
    <div className="site-bg bg-white scrollbar-hide">
      <section
        ref={heroRef}
        className="relative grid min-h-screen place-items-center overflow-hidden bg-black pb-14"
        data-id="hero"
        data-snap-section
      >
        {showHeroVideo && HERO_VIDEO_URL && (
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={HERO_VIDEO_POSTER}
              aria-hidden="true"
              className="h-full w-full object-cover opacity-25 sm:opacity-30"
            >
              <source src={HERO_VIDEO_URL} type="video/mp4" />
            </video>
            <div aria-hidden="true" className="hero-shade absolute inset-0" />
            <div aria-hidden="true" className="hero-vignette absolute inset-0" />
          </div>
        )}
        <div className="relative z-10 -translate-y-[50px]">
          <div
            className={[
              "select-none transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              visible.hero ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]",
            ].join(" ")}
          >
            <div className="relative inline-block">
              <div className="transition-[opacity,transform] duration-300 ease-out">
                <Link href="/" aria-label="Go to Home">
                  <LogoArchitectOfSound />
                </Link>

                {/* Proof strip — scrambled stats, retriggers on hover */}
                <div
                  className="mt-8 sm:mt-10 flex items-center justify-center gap-8 sm:gap-12 lg:gap-16 text-[#A1A1A6]"
                  onMouseEnter={retriggerScramble}
                  onMouseLeave={retriggerScramble}
                >
                  <div className="flex flex-col items-center">
                    <span className="font-serif-display text-[26px] sm:text-[32px] leading-none text-[#F2F2F2]">
                      <TextScramble
                        key={`perfs-${scrambleRun}`}
                        text={`~${STATS.performances}`}
                        duration={600}
                        charset="#%&$@+|0123456789"
                        scrambleFraction={0.5}
                        trigger={scrambleRun}
                      />
                    </span>
                    <span className="mt-2 text-[10px] sm:text-[11px] uppercase tracking-[0.28em]">
                      performances
                    </span>
                  </div>
                  <div className="h-10 w-px bg-white/15" />
                  <div className="flex flex-col items-center">
                    <span className="font-serif-display text-[26px] sm:text-[32px] leading-none text-[#F2F2F2]">
                      <TextScramble
                        key={`placs-${scrambleRun}`}
                        text={`~${STATS.placements}`}
                        duration={600}
                        charset="#%&$@+|0123456789"
                        scrambleFraction={0.5}
                        trigger={scrambleRun}
                      />
                    </span>
                    <span className="mt-2 text-[10px] sm:text-[11px] uppercase tracking-[0.28em]">
                      placements
                    </span>
                  </div>
                </div>

                <div className="mt-8 sm:mt-10 flex justify-center">
                  <Link
                    href="/epk"
                    className="epk-cta epk-cta-glow inline-flex items-center justify-center rounded-full px-10 py-4 text-[13px] sm:px-14 sm:py-5 sm:text-[15px] uppercase tracking-[0.3em] font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    EPK | 🥁
                  </Link>
                </div>
                <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-9 lg:gap-12">
                  <a
                    className="group relative inline-flex h-[62px] w-[62px] lg:h-[72px] lg:w-[72px] items-center justify-center rounded-full border border-white/10 bg-black/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    href="mailto:adakemusic@gmail.com"
                    aria-label="Email"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText("adakemusic@gmail.com").then(() => {
                        const btn = e.currentTarget;
                        const tip = btn.querySelector("[data-tooltip]") as HTMLElement;
                        if (tip) {
                          tip.style.opacity = "1";
                          tip.style.transform = "translateX(-50%) translateY(0)";
                          setTimeout(() => {
                            tip.style.opacity = "0";
                            tip.style.transform = "translateX(-50%) translateY(4px)";
                          }, 1800);
                        }
                      }).catch(() => {
                        window.location.href = "mailto:adakemusic@gmail.com";
                      });
                    }}
                  >
                    <span
                      data-tooltip
                      className="pointer-events-none absolute -bottom-8 left-1/2 whitespace-nowrap rounded-md bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-black shadow-md transition-all duration-300"
                      style={{ opacity: 0, transform: "translateX(-50%) translateY(4px)" }}
                    >
                      <span style={{
                        color: "#111",
                        WebkitTextFillColor: "#111",
                        backgroundImage: "none",
                        WebkitBackgroundClip: "border-box",
                        backgroundClip: "border-box",
                      }}>Copied!</span>
                    </span>
                    <svg viewBox="0 0 24 24" className="h-[41px] w-[41px] lg:h-[48px] lg:w-[48px] transition group-hover:brightness-110">
                      <defs>
                        <linearGradient id="socialGradientEmail" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="60%" stopColor="#8EC5FF" />
                          <stop offset="100%" stopColor="#FFFFFF" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"
                        fill="none"
                        stroke="url(#socialGradientEmail)"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 8 12 13 2 8"
                        fill="none"
                        stroke="url(#socialGradientEmail)"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                  <a
                    className="group inline-flex h-[62px] w-[62px] lg:h-[72px] lg:w-[72px] items-center justify-center rounded-full border border-white/10 bg-black/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    href="https://www.instagram.com/anthony_dake/"
                    target="_blank"
                    rel="noreferrer me"
                    aria-label="Instagram"
                  >
                    <svg viewBox="0 0 24 24" className="h-[41px] w-[41px] lg:h-[48px] lg:w-[48px] transition group-hover:brightness-110">
                      <defs>
                        <linearGradient id="socialGradientInstagram" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="60%" stopColor="#8EC5FF" />
                          <stop offset="100%" stopColor="#FFFFFF" />
                        </linearGradient>
                      </defs>
                      <rect
                        x="4"
                        y="4"
                        width="16"
                        height="16"
                        rx="4"
                        ry="4"
                        fill="none"
                        stroke="url(#socialGradientInstagram)"
                        strokeWidth="1.5"
                      />
                      <circle cx="12" cy="12" r="4" fill="none" stroke="url(#socialGradientInstagram)" strokeWidth="1.5" />
                      <circle cx="17" cy="7" r="1" fill="url(#socialGradientInstagram)" />
                    </svg>
                  </a>
                  <a
                    className="group inline-flex h-[62px] w-[62px] lg:h-[72px] lg:w-[72px] items-center justify-center rounded-full border border-white/10 bg-black/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    href="https://www.youtube.com/@anthony_dake"
                    target="_blank"
                    rel="noreferrer me"
                    aria-label="YouTube"
                  >
                    <svg viewBox="0 0 24 24" className="h-[41px] w-[41px] lg:h-[48px] lg:w-[48px] transition group-hover:brightness-110">
                      <defs>
                        <linearGradient id="socialGradientYouTube" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="60%" stopColor="#8EC5FF" />
                          <stop offset="100%" stopColor="#FFFFFF" />
                        </linearGradient>
                      </defs>
                      <rect
                        x="3.5"
                        y="7"
                        width="17"
                        height="10"
                        rx="3"
                        ry="3"
                        fill="none"
                        stroke="url(#socialGradientYouTube)"
                        strokeWidth="1.5"
                      />
                      <polygon points="11,9.5 15,12 11,14.5" fill="url(#socialGradientYouTube)" />
                    </svg>
                  </a>
                  <a
                    className="group inline-flex h-[62px] w-[62px] lg:h-[72px] lg:w-[72px] items-center justify-center rounded-full border border-white/10 bg-black/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    href="https://www.tiktok.com/@anthony_dake"
                    target="_blank"
                    rel="noreferrer me"
                    aria-label="TikTok"
                  >
                    <svg viewBox="0 0 24 24" className="h-[41px] w-[41px] lg:h-[48px] lg:w-[48px] transition group-hover:brightness-110">
                      <defs>
                        <linearGradient id="socialGradientTikTok" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="60%" stopColor="#8EC5FF" />
                          <stop offset="100%" stopColor="#FFFFFF" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M12.3 5.1v7.7l-1.6 1"
                        fill="none"
                        stroke="url(#socialGradientTikTok)"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12.3 6.2c1.1 1.5 2.6 2.3 4.6 2.5"
                        fill="none"
                        stroke="url(#socialGradientTikTok)"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="9.6"
                        cy="16"
                        r="2.9"
                        fill="none"
                        stroke="url(#socialGradientTikTok)"
                        strokeWidth="1.7"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={servicesRef}
        data-id="services"
        data-snap-section
        className="min-h-screen bg-black"
      >
        <div
          className={[
            "mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-6 px-6 py-20 transition-[opacity,transform]",
            "duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            visible.services ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]",
          ].join(" ")}
        >
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-40">
            <span>(02) — services</span>
          </p>
          <AudioShowcase />
          <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            <ServiceCard
              title="Live Performance"
              description="Tours, one-off shows, festival dates, sub work. Click track, IEM, or acoustic — whatever the gig needs."
              secondary="Available for fly dates nationwide"
              ctaLabel="Send a brief"
              onClick={onOpenBooking}
              icon={<DrumIcon />}
            />
            <ServiceCard
              title="Session Drums"
              description="Remote tracking from my room or in-person at your studio. Fast turnarounds, pro-quality stems."
              secondary="48-hour turnaround on most sessions"
              ctaLabel="Send a brief"
              onClick={onOpenBooking}
              icon={<HeadphonesIcon />}
            />
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.28em] opacity-30">
              <span>Recent — index of {projectIndex.length}</span>
            </p>
            <Link
              href="/placements"
              className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 text-[11px] uppercase tracking-[0.18em] opacity-60 transition-opacity hover:opacity-100"
            >
              {FEATURED_PLACEMENTS.map((p, i) => (
                <span key={`${p.artist}-${p.title}`} className="inline-flex items-center gap-3">
                  {i > 0 && <span className="opacity-40">·</span>}
                  <span>
                    {p.artist} — {p.title}
                  </span>
                </span>
              ))}
            </Link>
          </div>
        </div>
      </section>

      <section
        ref={epkRef}
        data-id="epk"
        data-snap-section
        className="min-h-screen bg-black"
      >
        <div
          className={[
            "mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 px-6 py-20 text-center transition-[opacity,transform]",
            "duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            visible.epk ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]",
          ].join(" ")}
        >
          <p className="text-[11px] uppercase tracking-[0.35em] text-black/50">
            (03) — booking
          </p>
          <h2 className="font-serif-display text-balance text-3xl tracking-[0.02em] text-black sm:text-4xl md:text-5xl">
            Live drums, session drums, music direction. Columbus, on call.
          </h2>
          <p className="max-w-lg text-[15px] leading-7 text-black/60">
            For artists, music directors, supervisors, and producers who need a player who shows up ready. Press kit and contact below.
          </p>
          <button
            type="button"
            onClick={onOpenBooking}
            className="epk-cta epk-cta-glow mt-2 inline-flex items-center justify-center rounded-full px-12 py-4.5 text-[13px] uppercase tracking-[0.3em] font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="submit-label">Book →</span>
          </button>
          <Link
            href="/epk"
            className="mt-2 text-[10px] uppercase tracking-[0.22em] text-white/40 transition-colors hover:text-white/70"
          >
            <span>Press kit →</span>
          </Link>
          <p className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] uppercase tracking-[0.22em] text-white/35">
            <Link href="/placements" className="hover:text-white/70 transition-colors">
              <span>Placements →</span>
            </Link>
            <span className="opacity-40">·</span>
            <Link href="/performance" className="hover:text-white/70 transition-colors">
              <span>Performance →</span>
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

type ServiceCardProps = {
  title: string;
  description: string;
  secondary: string;
  ctaLabel: string;
  onClick?: () => void;
  icon: React.ReactNode;
};

function ServiceCard({ title, description, secondary, ctaLabel, onClick, icon }: ServiceCardProps) {
  return (
    <div className="group flex flex-col rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 sm:p-8">
      <div className="mb-5">{icon}</div>
      <h3 className="text-balance text-[15px] uppercase tracking-[0.15em] sm:text-[17px]">
        <span>{title}</span>
      </h3>
      <p className="mt-3 text-[13px] leading-relaxed opacity-60 sm:text-[14px]">
        <span>{description}</span>
      </p>
      <p className="mt-4 text-[10px] uppercase tracking-[0.18em] opacity-30">
        <span>{secondary}</span>
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-2 text-[11px] uppercase tracking-[0.2em] opacity-70 transition-all hover:bg-white/10 hover:opacity-100"
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

function GradientDefs({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="60%" stopColor="#8EC5FF" />
        <stop offset="100%" stopColor="#FFFFFF" />
      </linearGradient>
    </defs>
  );
}

function DrumIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
      <GradientDefs id="svc-drum" />
      <ellipse cx="20" cy="22" rx="13" ry="4.5" fill="none" stroke="url(#svc-drum)" strokeWidth="1.5" />
      <line x1="7" y1="22" x2="7" y2="30" stroke="url(#svc-drum)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="33" y1="22" x2="33" y2="30" stroke="url(#svc-drum)" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="20" cy="30" rx="13" ry="4.5" fill="none" stroke="url(#svc-drum)" strokeWidth="1.5" />
      <line x1="13" y1="14" x2="27" y2="6" stroke="url(#svc-drum)" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="6" x2="27" y2="14" stroke="url(#svc-drum)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HeadphonesIcon() {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
      <GradientDefs id="svc-headphones" />
      <path d="M7 22 Q7 8 20 8 Q33 8 33 22" fill="none" stroke="url(#svc-headphones)" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="5" y="21" width="7" height="11" rx="2" fill="none" stroke="url(#svc-headphones)" strokeWidth="1.5" />
      <rect x="28" y="21" width="7" height="11" rx="2" fill="none" stroke="url(#svc-headphones)" strokeWidth="1.5" />
    </svg>
  );
}

