"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LogoArchitectOfSound from "./LogoArchitectOfSound";

type HomeClientProps = {
  initialSection?: "hero" | "projects";
  syncRoute?: boolean;
};

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function HomeClient({
  initialSection = "hero",
  syncRoute = true,
}: HomeClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const [visible, setVisible] = useState<{ hero: boolean; projects: boolean }>(() =>
    reduceMotion ? { hero: true, projects: true } : { hero: false, projects: false }
  );
  const [activeId, setActiveId] = useState<"hero" | "projects">(initialSection);
  const [snapAnimating, setSnapAnimating] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const projectsRef = useRef<HTMLElement | null>(null);

  useIsoLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Ensure route entry points match the intended section without visible jump.
    const target = initialSection === "projects" ? projectsRef.current?.offsetTop ?? 0 : 0;
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
            setActiveId(id as "hero" | "projects");
            setVisible((prev) => (prev[id as "hero" | "projects"] ? prev : { ...prev, [id as "hero" | "projects"]: true }));
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

    const sections = [heroRef.current, projectsRef.current].filter(Boolean) as HTMLElement[];

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
  }, [snapAnimating]);

  return (
    <div
      ref={containerRef}
      className="site-bg min-h-screen snap-y snap-mandatory overflow-y-scroll bg-white scrollbar-hide"
      style={{ scrollBehavior: "smooth" }}
    >
      <section
        ref={heroRef}
        className="relative grid h-screen place-items-center snap-start bg-[#111113]"
        data-id="hero"
        data-snap-section
      >
        <div className="-translate-y-[17px]">
          <div
            className={[
              "select-none transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              visible.hero ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]",
            ].join(" ")}
          >
            <div className="mb-4 text-center text-[11px] uppercase tracking-[0.28em] text-black/55 sm:text-[12px]">
              📍 Columbus, Ohio • 🎵 Producer/Drummer • 💼 Book: adakemusic@gmail.com • 📲 @anthony_dake
            </div>
            <Link href="/socials" aria-label="Go to Socials">
              <LogoArchitectOfSound />
            </Link>
            <div className="mt-4 flex items-center justify-center gap-6">
              <a
                className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                href="https://www.instagram.com/anthony_dake/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-black/65 transition group-hover:text-black">
                  <rect x="4" y="4" width="16" height="16" rx="4" ry="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="17" cy="7" r="1" fill="currentColor" />
                </svg>
              </a>
              <a
                className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                href="https://www.youtube.com/@anthony_dake"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-black/65 transition group-hover:text-black">
                  <rect x="3.5" y="7" width="17" height="10" rx="3" ry="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <polygon points="11,9.5 15,12 11,14.5" fill="currentColor" />
                </svg>
              </a>
              <a
                className="group inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                href="https://www.tiktok.com/@anthony_dake"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-black/65 transition group-hover:text-black">
                  <path
                    d="M14 5v8.2a3.2 3.2 0 1 1-2-3V7.2c0-.5.4-.9.9-.9h1.1z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 6.2c.9 1.2 2.1 1.9 3.6 2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
        {/* Scroll indicator handled globally on the home page */}
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
