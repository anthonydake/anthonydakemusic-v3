"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import LogoArchitectOfSound from "./LogoArchitectOfSound";
import HeroListen from "./HeroListen";
import HeroTexts from "./HeroTexts";
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

  return (
    <div className="bg-black">
      <section
        ref={heroRef}
        data-id="hero"
        className="relative -mt-14 bg-black md:mt-0 md:pb-16"
      >
        <div className="md:mx-auto md:grid md:max-w-[1040px] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-center md:gap-14 md:px-8 md:pt-24">
          <div className="relative md:static">
            <Image
              src="/photos/epk-comfest-2024.jpg"
              alt="Anthony Dake playing drums on the ComFest main stage in Columbus, 2024"
              width={1200}
              height={1500}
              priority
              sizes="(max-width: 768px) 100vw, 480px"
              className="aspect-[4/5] w-full object-cover object-[center_20%] md:rounded-2xl"
            />
            <div
              aria-hidden="true"
              className="hero-fade pointer-events-none absolute inset-x-0 bottom-0 h-[45%] md:hidden"
            />
          </div>

          <div className="relative -mt-28 px-6 text-center md:mt-0 md:px-0">
            <LogoArchitectOfSound />
            <p className="mt-4 text-[26px] leading-[1.2] text-[#F2F2F2] sm:text-[28px]">
              {Math.floor(STATS.performances / 10) * 10}+ shows. {Math.floor(STATS.placements / 10) * 10}+ records.
            </p>
            <p className="mx-auto mt-3 max-w-[30ch] text-[15px] leading-[1.55] text-[#9A9A9A] sm:text-[16px]">
              Drummer and producer for live shows, sessions, and records. Columbus, OH.
            </p>
            <div className="mt-7 flex items-center justify-center gap-6">
              <button type="button" onClick={onOpenBooking} className="epk-cta">
                Book →
              </button>
              <HeroListen />
            </div>
          </div>
        </div>

        <HeroTexts />
      </section>

      <section
        ref={servicesRef}
        data-id="services"
        className="mx-auto max-w-[640px] px-6 py-16 sm:py-24"
      >
        <h2 className="text-[15px] text-[#F2F2F2] mb-6">What I do</h2>
        <div className="space-y-5 text-[15px] leading-[1.6] text-[#9A9A9A] sm:text-[16px]">
          <p>
            <strong className="font-normal text-[#F2F2F2]">Drummer</strong>
            {" — live shows, tours, and fly dates; session drums remote or in your room. Click, IEM, acoustic and hybrid rigs."}
          </p>
          <p>
            <strong className="font-normal text-[#F2F2F2]">Producer</strong>
            {" — drum programming and production for records. Remote, fast, release-ready stems."}
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
        className="mx-auto max-w-[640px] px-6 py-16 sm:py-24"
      >
        <h2 className="text-[15px] text-[#F2F2F2] mb-6">Proof</h2>
        <p className="text-[15px] leading-[1.6] text-[#9A9A9A] sm:text-[16px]">
          {names}
        </p>
        <p className="mt-2 text-[15px] leading-[1.6] text-[#9A9A9A] sm:text-[16px]">
          Columbus Pride · ComFest · Short North Stage · Shadowbox Live · Louis Pettinelli Entertainment · Bluecoats · Rhythm X · Blue Knights
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
