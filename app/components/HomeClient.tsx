"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import LogoArchitectOfSound from "./LogoArchitectOfSound";
import HeroTexts from "./HeroTexts";
import HomeReel from "./HomeReel";
import FooterLine from "./FooterLine";
import { projectIndex } from "../../data/projects.data";
import { STATS } from "../../data/stats";
import { openBooking as openBookingPreset } from "@/lib/booking";

type SectionId = "hero" | "services" | "proof";

type HomeClientProps = {
  initialSection?: SectionId;
  onOpenBooking?: () => void;
};

const OFFER_CARDS = [
  {
    id: "drummer",
    title: "Drummer",
    photo: "/photos/epk-whitehall-2025.jpg",
    alt: "Anthony Dake behind the kit at the Whitehall Food Truck Festival, 2025",
    objectPosition: "center 35%",
    copy: "Live shows, tours, and fly dates. Session drums remote or in your room. Click, IEM, acoustic and hybrid rigs.",
    linkLabel: "Book a date →",
    preset: "Live show / tour date",
  },
  {
    id: "producer",
    title: "Producer",
    photo: "/photos/epk-hybrid-rig-2025.jpg",
    alt: "Anthony Dake playing a hybrid acoustic and electronic rig, 2025",
    objectPosition: "center 30%",
    copy: "Drum programming and production for records. Remote, fast, release-ready stems.",
    linkLabel: "Send a brief →",
    preset: "Production / drum programming",
  },
] as const;

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
      const parts = p.artist.split(/\s+&\s+|\s+x\s+|,\s+/i);
      for (const raw of parts) {
        const name = raw.trim();
        if (!name) continue;
        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(name);
        if (out.length === 6) break;
      }
      if (out.length === 6) break;
    }
    return out.join(" · ");
  }, []);

  return (
    <div className="bg-black">
      <section
        ref={heroRef}
        data-id="hero"
        className="relative -mt-14 bg-black md:mt-0 md:flex md:min-h-[calc(100svh-3.5rem)] md:flex-col md:justify-center md:pb-12"
      >
        <div className="md:mx-auto md:grid md:w-full md:max-w-[1200px] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-12 md:px-8 md:py-10 short:py-6">
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
            <p className="mx-auto mt-3 max-w-[30ch] text-[15px] leading-[1.55] text-[#9A9A9A] sm:text-[16px] short:max-w-[44ch]">
              Drummer and producer for live shows, sessions, and records. Columbus, OH.
            </p>
            <div className="mt-7 flex items-center justify-center short:mt-5">
              <button
                type="button"
                onClick={onOpenBooking}
                className="epk-cta min-w-[240px] sm:min-w-[260px]"
              >
                Book →
              </button>
            </div>
            <HeroTexts />
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-4 hidden justify-center md:flex"
        >
          <span className="animate-scrollFlash text-[12px] uppercase tracking-[0.28em] text-[#F2F2F2]">
            (scroll)
          </span>
        </div>
      </section>

      <section
        ref={servicesRef}
        data-id="services"
        className="mx-auto max-w-[960px] px-6 py-16 sm:py-24"
      >
        <h2 className="mb-6 text-[15px] text-[#F2F2F2]">What I do</h2>
        <div className="grid gap-10 md:grid-cols-2 md:gap-8">
          {OFFER_CARDS.map((card) => (
            <article key={card.id}>
              <Image
                src={card.photo}
                alt={card.alt}
                width={1200}
                height={1500}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 460px"
                className="aspect-[4/3] w-full rounded-2xl object-cover"
                style={{ objectPosition: card.objectPosition }}
              />
              <h3 className="mt-5 text-[20px] text-[#F2F2F2]">{card.title}</h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-[#9A9A9A]">{card.copy}</p>
              <button
                type="button"
                onClick={() => openBookingPreset(card.preset)}
                className="mt-4 text-[15px] text-[#F2F2F2] transition-colors hover:text-[#9A9A9A]"
              >
                {card.linkLabel}
              </button>
            </article>
          ))}
        </div>
      </section>

      <HomeReel />

      <section
        ref={proofRef}
        data-id="proof"
        className="mx-auto max-w-[640px] px-6 py-16 sm:py-24"
      >
        <h2 className="mb-6 text-[15px] text-[#F2F2F2]">Proof</h2>
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

      <section className="mx-auto max-w-[640px] border-t border-white/[0.08] px-6 py-20 text-center sm:py-28">
        <p className="text-[26px] leading-[1.25] text-[#F2F2F2] sm:text-[30px]">
          Got a date? Tell me about it.
        </p>
        <p className="mx-auto mt-3 max-w-[36ch] text-[15px] leading-[1.6] text-[#9A9A9A]">
          Live shows, sessions, and records. Columbus, OH, and fly dates nationwide.
        </p>
        <div className="mt-8 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenBooking}
            className="epk-cta min-w-[240px] sm:min-w-[260px]"
          >
            Book →
          </button>
        </div>
      </section>

      <FooterLine />
    </div>
  );
}
