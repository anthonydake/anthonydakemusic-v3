"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import LogoArchitectOfSound from "./LogoArchitectOfSound";
import { useTransition } from "./TransitionProvider";
import { projectIndex } from "../../data/projects.data";

type HomeClientProps = {
  initialSection?: "hero" | "services" | "epk";
  nextHref?: string;
  onOpenBooking?: () => void;
};

const FEATURED_PLACEMENTS = [
  { artist: "AR!YAH", title: "Aura" },
  { artist: "Madelyn Leona", title: "Back & Forth" },
  { artist: "Jae Esquire", title: "Get Down" },
  { artist: "KJ The Cool Nerd", title: "Heartbreaker" },
  { artist: "KJ The Cool Nerd", title: "Pray For Me" },
];

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function HomeClient({
  initialSection = "hero",
  nextHref,
  onOpenBooking,
}: HomeClientProps) {
  const { isTransitioning, isMobileFallback, triggerTransition } = useTransition();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const [visible, setVisible] = useState<{ hero: boolean; services: boolean; epk: boolean }>(() =>
    reduceMotion
      ? { hero: true, services: true, epk: true }
      : { hero: false, services: false, epk: false }
  );
  const [snapAnimating, setSnapAnimating] = useState(false);
  const [pillReady, setPillReady] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const servicesRef = useRef<HTMLElement | null>(null);
  const epkRef = useRef<HTMLElement | null>(null);

  useIsoLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Ensure route entry points match the intended section without visible jump.
    const target =
      initialSection === "epk"
        ? epkRef.current?.offsetTop ?? 0
        : initialSection === "services"
          ? servicesRef.current?.offsetTop ?? 0
          : 0;
    const prev = container.style.scrollBehavior;
    container.style.scrollBehavior = "auto";
    container.scrollTop = target;
    container.style.scrollBehavior = prev;
  }, [initialSection]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (reduceMotion) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-id");
          if (!id) return;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            setVisible((prev) =>
              prev[id as "hero" | "services" | "epk"]
                ? prev
                : { ...prev, [id as "hero" | "services" | "epk"]: true }
            );
          }
        });
      },
      { root: containerRef.current, threshold: [0.55, 0.8] }
    );

    const nodes = containerRef.current.querySelectorAll("[data-snap-section]");
    nodes.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (isMobileFallback) return;

    const sections = [heroRef.current, servicesRef.current, epkRef.current].filter(Boolean) as HTMLElement[];

    const animateTo = (target: number) => {
      if (snapAnimating) return;
      setSnapAnimating(true);
      container.scrollTo({ top: target, behavior: "smooth" });
      window.setTimeout(() => setSnapAnimating(false), 750);
    };

    const handleWheel = (e: WheelEvent) => {
      if (snapAnimating) return;
      if (Math.abs(e.deltaY) < 10) return;
      e.preventDefault();
      const currentTop = container.scrollTop;
      const positions = sections.map((s) => s.offsetTop);
      const currentIndex =
        positions.reduce((closest, pos, idx) => {
          return Math.abs(pos - currentTop) < Math.abs(positions[closest] - currentTop) ? idx : closest;
        }, 0) || 0;
      const dir = e.deltaY > 0 ? 1 : -1;
      const nextIndex = Math.min(Math.max(currentIndex + dir, 0), positions.length - 1);
      animateTo(positions[nextIndex]);
    };

    let touchStart = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (snapAnimating) return;
      const dy = e.changedTouches[0].clientY - touchStart;
      if (Math.abs(dy) < 24) return;
      const currentTop = container.scrollTop;
      const positions = sections.map((s) => s.offsetTop);
      const currentIndex =
        positions.reduce((closest, pos, idx) => {
          return Math.abs(pos - currentTop) < Math.abs(positions[closest] - currentTop) ? idx : closest;
        }, 0) || 0;
      const dir = dy < 0 ? 1 : -1;
      const nextIndex = Math.min(Math.max(currentIndex + dir, 0), positions.length - 1);
      animateTo(positions[nextIndex]);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobileFallback, snapAnimating]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!isMobileFallback) return;
    if (!nextHref) return;
    if (isTransitioning) return;

    let touchStart = 0;
    let triggered = false;
    const swipeThreshold = 42;

    const handleTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (triggered) return;
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (triggered) return;
      const dy = e.changedTouches[0].clientY - touchStart;
      if (dy < -swipeThreshold) {
        triggered = true;
        triggerTransition(nextHref);
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobileFallback, isTransitioning, nextHref, triggerTransition]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.add("no-scroll");
    document.body.classList.add("no-scroll");
    return () => {
      document.documentElement.classList.remove("no-scroll");
      document.body.classList.remove("no-scroll");
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setPillReady(true), 6000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className={[
        "site-bg min-h-screen bg-white scrollbar-hide",
        "overflow-y-hidden",
        isMobileFallback ? "" : "snap-y snap-mandatory",
      ].join(" ")}
      style={{ scrollBehavior: "smooth" }}
    >
      <section
        ref={heroRef}
        className="relative grid h-screen place-items-center snap-start bg-black"
        data-id="hero"
        data-snap-section
      >
        <div className="relative z-10 -translate-y-[90px]">
          <div
            className={[
              "select-none transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              visible.hero ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]",
            ].join(" ")}
          >
            <div className="relative inline-block">
              <div className="transition-[opacity,transform] duration-300 ease-out">
                <div className="mb-5 text-center text-[12px] uppercase tracking-[0.26em] text-black/60 sm:text-[13px]" />
                <Link href="/" aria-label="Go to Home">
                  <LogoArchitectOfSound />
                </Link>
                
                <div className="mt-3 flex justify-center">
                  <Link
                    href="/epk"
                    className="epk-cta epk-cta-glow inline-flex items-center justify-center rounded-full px-10 py-4 text-[13px] sm:px-14 sm:py-5 sm:text-[15px] lg:px-16 lg:text-[16px] uppercase tracking-[0.3em] font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    EPK | 🥁
                  </Link>
                </div>
                <div className="mt-6 lg:mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-9 lg:gap-12">
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
        className="snap-start min-h-screen bg-black"
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
        className="snap-start min-h-screen bg-black"
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
          <h2 className="font-serif-display text-3xl tracking-[0.02em] text-black sm:text-4xl md:text-5xl">
            Live drums, session drums, music direction. Columbus, on call.
          </h2>
          <p className="max-w-lg text-[15px] leading-7 text-black/60">
            For artists, music directors, supervisors, and producers who need a player who shows up ready. Press kit and contact below.
          </p>
          <Link
            href="/epk"
            className="epk-cta epk-cta-glow mt-2 inline-flex items-center justify-center rounded-full px-12 py-4.5 text-[13px] uppercase tracking-[0.3em] font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            EPK | 🥁
          </Link>
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
      <h3 className="text-[15px] uppercase tracking-[0.15em] sm:text-[17px]">
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

