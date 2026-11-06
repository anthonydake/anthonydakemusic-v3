"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import LogoArchitectOfSound from "./LogoArchitectOfSound";
import HeroListen from "./HeroListen";
import FooterLine from "./FooterLine";
import { projectIndex } from "../../data/projects.data";
import { STATS } from "../../data/stats";
import { testimonials } from "../../data/testimonials.data";

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
        className="relative -mt-14 bg-black md:mx-auto md:mt-0 md:grid md:max-w-[1040px] md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:items-center md:gap-14 md:px-8 md:pt-24 md:pb-16"
      >
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
          <p className="mx-auto mt-4 max-w-[24ch] text-[17px] leading-[1.45] text-[#F2F2F2] sm:text-[18px]">
            The drummer for your show, session, or record.
          </p>
          <p className="mx-auto mt-3 max-w-[34ch] text-[13px] leading-[1.6] text-[#9A9A9A]">
            ~{STATS.performances} shows · ~{STATS.placements} records · Columbus Pride · ComFest · Blue Knights · Bluecoats
          </p>
          <div className="mt-7 flex items-center justify-center gap-6">
            <button type="button" onClick={onOpenBooking} className="epk-cta">
              Book →
            </button>
            <HeroListen />
          </div>
          <p className="mt-5 text-[12px] text-[#5C5C5C]">Columbus, OH · fly dates nationwide</p>
        </div>
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
        {testimonials[0] && (
          <figure className="mt-10 mx-auto max-w-[360px]">
            <Image
              src={testimonials[0].image}
              alt={testimonials[0].alt}
              width={testimonials[0].width}
              height={testimonials[0].height}
              loading="lazy"
              sizes="(max-width: 360px) 100vw, 360px"
              className="h-auto w-full mx-auto select-none"
            />
            <figcaption className="mt-3 text-[12px] text-[#5C5C5C] text-center">
              {testimonials[0].caption}
            </figcaption>
          </figure>
        )}
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
