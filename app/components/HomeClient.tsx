"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import LogoArchitectOfSound from "./LogoArchitectOfSound";
import { projects } from "@/lib/projects";

type HomeClientProps = {
  initialSection?: "hero" | "projects";
  syncRoute?: boolean;
};

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function HomeClient({ initialSection = "hero", syncRoute = true }: HomeClientProps) {
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

  const allTags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const selectedTags = useMemo(() => {
    const raw = searchParams.getAll("tag").map((t) => t.trim()).filter(Boolean);
    if (raw.length === 0) return [] as string[];

    const allowed = new Set(allTags);
    const out = Array.from(new Set(raw.filter((t) => allowed.has(t))));
    out.sort((a, b) => a.localeCompare(b));
    return out;
  }, [allTags, searchParams]);

  const filteredProjects = useMemo(() => {
    if (selectedTags.length === 0) return projects;
    return projects.filter((p) => selectedTags.some((t) => p.tags.includes(t)));
  }, [selectedTags]);

  const setTagsInUrl = (nextTags: string[]) => {
    const qs = new URLSearchParams(searchParams.toString());
    qs.delete("tag");
    nextTags
      .filter(Boolean)
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .forEach((t) => qs.append("tag", t));
    const q = qs.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setTagsInUrl(selectedTags.filter((t) => t !== tag));
    } else {
      setTagsInUrl([...selectedTags, tag]);
    }
  };

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
        className="relative grid min-h-screen place-items-center snap-start"
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white" />
        <div className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center">
          <span className="text-[11px] uppercase tracking-[0.28em] text-black/70 animate-scrollFlash">
            (scroll)
          </span>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-white/40 to-white" />
      </section>

      <section
        ref={projectsRef}
        data-id="projects"
        data-snap-section
        className="snap-start min-h-screen bg-white px-6 py-14"
      >
        <div
          className={[
            "mx-auto w-full max-w-6xl space-y-6 transition-[opacity,transform] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            visible.projects ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-[0.98]",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white via-white/70 to-white/0" />
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.32em] text-black/55">Projects</p>
            <h2 className="text-2xl font-semibold tracking-tight">Selected work</h2>
            <p className="text-sm text-black/60">Scroll snapped from the logo — explore the grid below.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTagsInUrl([])}
              className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] transition ${
                selectedTags.length === 0
                  ? "border-black/60 text-black"
                  : "border-black/15 text-black/60 hover:border-black/30 hover:text-black"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.22em] transition ${
                    active
                      ? "border-black/60 text-black"
                      : "border-black/15 text-black/60 hover:border-black/30 hover:text-black"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
          <div className="rounded-[20px] border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-black/60">Featured audio</p>
                <p className="text-sm text-black/70">Drive streams while staying on-site.</p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <a className="underline underline-offset-4" href="https://open.spotify.com/" target="_blank" rel="noreferrer">
                  Spotify
                </a>
                <a className="underline underline-offset-4" href="https://music.apple.com/" target="_blank" rel="noreferrer">
                  Apple Music
                </a>
                <a className="underline underline-offset-4" href="https://soundcloud.com/" target="_blank" rel="noreferrer">
                  SoundCloud
                </a>
              </div>
            </div>
            <div className="mt-3 rounded-[14px] border border-black/10 bg-black/3 p-3 text-sm text-black/70">
              Replace this with your preferred embed or audio source to keep plays counted on your streaming platforms.
            </div>
          </div>
          <div className="mt-4 grid gap-4">
            {filteredProjects.map((p) => (
              <Link
                key={p.slug}
                href={`/projects/${p.slug}`}
                className="group relative overflow-hidden rounded-[24px] border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold tracking-tight">
                      {p.title}
                      <span className="ml-2 text-sm font-normal text-black/50">— {p.subtitle}</span>
                    </div>
                    <div className="text-sm text-black/65">{p.blurb}</div>
                    <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-black/50">{p.tags.join(" • ")}</div>
                  </div>
                  <div className="text-xs uppercase tracking-[0.24em] text-black/55">
                    {p.role} • {p.year}
                  </div>
                </div>
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition duration-200 group-hover:opacity-80"
                  style={{ backgroundImage: `linear-gradient(135deg, ${p.tone[0]}, ${p.tone[1]})`, mixBlendMode: "multiply" }}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
