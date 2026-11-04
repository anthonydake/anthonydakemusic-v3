"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import LogoArchitectOfSound from "./LogoArchitectOfSound";
import FooterLine from "./FooterLine";
import { projectIndex } from "../../data/projects.data";
import { STATS } from "../../data/stats";

type SectionId = "hero" | "services" | "proof";

type HomeClientProps = {
  initialSection?: SectionId;
  onOpenBooking?: () => void;
};

export default function HomeClient({
  initialSection = "hero",
  onOpenBooking,
}: HomeClientProps) {
  const reduceMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  // Hero starts visible always — it's above the fold and must not depend on
  // the observer (some touch browsers don't fire the first entry).
  const [visible, setVisible] = useState<Record<SectionId, boolean>>(() =>
    reduceMotion
      ? { hero: true, services: true, proof: true }
      : { hero: true, services: false, proof: false }
  );
  const heroRef = useRef<HTMLElement | null>(null);
  const servicesRef = useRef<HTMLElement | null>(null);
  const proofRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (initialSection === "hero") return;
    const target =
      initialSection === "proof" ? proofRef.current : initialSection === "services" ? servicesRef.current : null;
    if (!target) return;
    target.scrollIntoView({ block: "start", behavior: "auto" });
  }, [initialSection]);

  useEffect(() => {
    if (reduceMotion) return;

    const keys: SectionId[] = ["hero", "services", "proof"];
    const revealAll = () =>
      setVisible((prev) =>
        prev.hero && prev.services && prev.proof ? prev : { hero: true, services: true, proof: true }
      );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-id");
          if (!id) return;
          if (!entry.isIntersecting) return;
          const key = id as SectionId;
          if (!keys.includes(key)) return;
          setVisible((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
        });
      },
      { root: null, threshold: 0.08, rootMargin: "0px 0px -10% 0px" }
    );

    const nodes = document.querySelectorAll("[data-snap-section]");
    nodes.forEach((node) => observer.observe(node));

    // Fail-open fallbacks (see CLAUDE.md Home Page Anatomy).
    const onScroll = () => revealAll();
    window.addEventListener("scroll", onScroll, { passive: true, once: true });
    const fallbackTimer = window.setTimeout(revealAll, 1200);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(fallbackTimer);
    };
  }, [reduceMotion]);

  const names = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const p of projectIndex) {
      if (seen.has(p.artist)) continue;
      seen.add(p.artist);
      out.push(p.artist);
      if (out.length === 5) break;
    }
    return out.join(" · ");
  }, []);

  const fade = (on: boolean) =>
    `transition-opacity duration-300 ease-out ${on ? "opacity-100" : "opacity-0"}`;

  return (
    <div className="bg-black">
      <section
        ref={heroRef}
        data-id="hero"
        data-snap-section
        className="flex min-h-[88svh] flex-col items-center justify-center bg-black px-6 pt-14 pb-16 text-center"
      >
        <LogoArchitectOfSound showPortrait={false} />
        <p className="mx-auto mt-6 max-w-[28ch] text-[15px] leading-[1.6] text-[#9A9A9A] sm:text-[16px]">
          Drummer and music director. Live, studio, remote. Columbus, OH.
        </p>
        <div className="mt-10">
          <button type="button" onClick={onOpenBooking} className="epk-cta">
            Book →
          </button>
        </div>
      </section>

      <section
        ref={servicesRef}
        data-id="services"
        data-snap-section
        className={`${fade(visible.services)} mx-auto max-w-[640px] px-6 py-16 sm:py-24`}
      >
        <h2 className="text-[15px] text-[#F2F2F2] mb-6">What I do</h2>
        <div className="space-y-5 text-[15px] leading-[1.6] text-[#9A9A9A] sm:text-[16px]">
          <p>
            <strong className="font-normal text-[#F2F2F2]">Live performance</strong>
            {" — tours, one-offs, festivals, sub work. Click, IEM, or acoustic."}
          </p>
          <p>
            <strong className="font-normal text-[#F2F2F2]">Session drums</strong>
            {" — remote from my room or in yours. 48-hour turnaround."}
          </p>
          <p>
            <strong className="font-normal text-[#F2F2F2]">Music direction</strong>
            {" — I build the band and run the room. Church, corporate, touring."}
          </p>
        </div>
        <p className="mt-8">
          <button
            type="button"
            onClick={onOpenBooking}
            className="text-[15px] text-[#F2F2F2] hover:text-[#9A9A9A] transition-colors"
          >
            Send a brief →
          </button>
        </p>
      </section>

      <section
        ref={proofRef}
        data-id="proof"
        data-snap-section
        className={`${fade(visible.proof)} mx-auto max-w-[640px] px-6 py-16 sm:py-24`}
      >
        <h2 className="text-[15px] text-[#F2F2F2] mb-6">Proof</h2>
        <p className="text-[15px] leading-[1.6] text-[#9A9A9A] sm:text-[16px]">
          ~{STATS.performances} performances · ~{STATS.placements} placements
        </p>
        <p className="mt-2 text-[15px] leading-[1.6] text-[#9A9A9A] sm:text-[16px]">
          {names}
        </p>
        <p className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-[#F2F2F2]">
          <Link href="/placements" className="hover:text-[#9A9A9A] transition-colors">
            Placements →
          </Link>
          <Link href="/performance" className="hover:text-[#9A9A9A] transition-colors">
            Performance →
          </Link>
          <Link href="/epk" className="hover:text-[#9A9A9A] transition-colors">
            Press kit →
          </Link>
        </p>
      </section>

      <FooterLine />
    </div>
  );
}
