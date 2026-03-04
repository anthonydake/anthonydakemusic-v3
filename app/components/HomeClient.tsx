"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import LogoArchitectOfSound from "./LogoArchitectOfSound";
import ArchiveModal from "./ArchiveModal";
import { useTransition } from "./TransitionProvider";

type HomeClientProps = {
  initialSection?: "hero" | "archive" | "projects";
  nextHref?: string;
};

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function HomeClient({
  initialSection = "hero",
  nextHref,
}: HomeClientProps) {
  const { isTransitioning, isMobileFallback, triggerTransition } = useTransition();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const [visible, setVisible] = useState<{ hero: boolean; archive: boolean; projects: boolean }>(() =>
    reduceMotion ? { hero: true, archive: true, projects: true } : { hero: false, archive: false, projects: false }
  );
  const [snapAnimating, setSnapAnimating] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [pillReady, setPillReady] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const archiveRef = useRef<HTMLElement | null>(null);
  const projectsRef = useRef<HTMLElement | null>(null);

  useIsoLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Ensure route entry points match the intended section without visible jump.
    const target =
      initialSection === "projects"
        ? projectsRef.current?.offsetTop ?? 0
        : initialSection === "archive"
          ? archiveRef.current?.offsetTop ?? 0
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
              prev[id as "hero" | "archive" | "projects"]
                ? prev
                : { ...prev, [id as "hero" | "archive" | "projects"]: true }
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

    const sections = [heroRef.current, archiveRef.current, projectsRef.current].filter(Boolean) as HTMLElement[];

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
      <ArchiveModal onOpenChange={setArchiveModalOpen} />
      {pillReady && !archiveModalOpen && !isTransitioning ? (
        <a
          href="https://www.beatstars.com/anthonydake"
          target="_blank"
          rel="noreferrer"
          className="archive-pill fixed bottom-6 right-6 z-[9990] inline-flex items-center justify-center rounded-full px-5 py-2 text-[12px] lowercase tracking-[0.2em]"
        >
          archive
        </a>
      ) : null}
      <section
        ref={heroRef}
        className="relative grid h-screen place-items-center snap-start bg-[#111113]"
        data-id="hero"
        data-snap-section
      >
        <div className="-translate-y-[90px]">
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
                <div className="mt-3 text-center text-[11px] uppercase tracking-[0.24em] text-black/55">
                  Producer • Drummer • Music Director
                </div>
                <div className="mt-4 flex items-center justify-center gap-8">
                  <a
                    className="group inline-flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    href="mailto:adakemusic@gmail.com"
                    aria-label="Email"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6 transition group-hover:brightness-110">
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
                    className="group inline-flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    href="https://www.instagram.com/anthony_dake/"
                    target="_blank"
                    rel="noreferrer me"
                    aria-label="Instagram"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6 transition group-hover:brightness-110">
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
                    className="group inline-flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    href="https://www.youtube.com/@anthony_dake"
                    target="_blank"
                    rel="noreferrer me"
                    aria-label="YouTube"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6 transition group-hover:brightness-110">
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
                    className="group inline-flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    href="https://www.tiktok.com/@anthony_dake"
                    target="_blank"
                    rel="noreferrer me"
                    aria-label="TikTok"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6 transition group-hover:brightness-110">
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
        {/* Scroll indicator handled globally on the home page */}
      </section>

      <section
        ref={archiveRef}
        data-id="archive"
        data-snap-section
        className="snap-start min-h-screen bg-white"
      >
        <div
          className={[
            "mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-10 px-6 py-20 transition-[opacity,transform]",
            "duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            visible.archive ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]",
          ].join(" ")}
        >
          <div className="space-y-6">
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/50">Archive Notes</p>
            <h2 className="text-3xl tracking-[0.08em] text-black sm:text-4xl">Architecture Over Algorithms</h2>
            <p className="max-w-xl whitespace-pre-line text-[15px] leading-7 text-black/70">
              I don’t produce for trends.
              {"\n"}I build frameworks for records.
              {"\n\n"}Rhythm as foundation.
              {"\n"}Space as intention.
              {"\n"}Emotion engineered.
            </p>
            <div>
              <a
                href="https://www.beatstars.com/anthonydake"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-black/15 bg-white/70 px-6 py-3 text-[11px] uppercase tracking-[0.35em] text-black transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Explore the Archive
              </a>
            </div>
          </div>
          <div className="space-y-6">
            {/* TODO: Embed 3 BeatStars preview players when track URLs are provided. */}
          </div>
        </div>
      </section>

      <section
        ref={projectsRef}
        data-id="projects"
        data-snap-section
        className="snap-start min-h-screen bg-white"
      >
        <div
          className={[
            "mx-auto h-full w-full transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            visible.projects ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]",
          ].join(" ")}
          aria-hidden="true"
        />
      </section>
    </div>
  );
}
