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

  useEffect(() => {
    if (!syncRoute) return;
    if (snapAnimating) return;

    const desired = activeId === "projects" ? "/projects" : "/";
    if (pathname !== desired) {
      const q = searchParams.toString();
      router.replace(q ? `${desired}?${q}` : desired, { scroll: false });
    }
  }, [activeId, pathname, router, searchParams, snapAnimating, syncRoute]);

  return (
    <div
      ref={containerRef}
      className="site-bg h-screen snap-y snap-mandatory overflow-y-scroll bg-white scrollbar-hide"
      style={{ scrollBehavior: "smooth" }}
    >
      <section
        ref={heroRef}
        className="relative grid min-h-screen place-items-center snap-start bg-[#111113]"
        data-id="hero"
        data-snap-section
      >
        <div
          className={[
            "select-none transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            visible.hero ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]",
          ].join(" ")}
        >
          <Link href="/about" aria-label="Go to Info">
            <LogoArchitectOfSound />
          </Link>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
          <span className="text-[11px] uppercase tracking-[0.28em] text-black/70 animate-scrollFlash">
            (scroll)
          </span>
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
