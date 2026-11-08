"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import LogoArchitectOfSound from "./LogoArchitectOfSound";
import HeroTexts from "./HeroTexts";
import HomeReel from "./HomeReel";
import FooterLine from "./FooterLine";
import ProductionRows from "./ProductionRows";
import { PRODUCTIONS } from "../../data/productions.data";
import { STATS } from "../../data/stats";
import { STAGE_ARTISTS, ORGANIZATIONS } from "../../data/credits.data";
import { openBooking as openBookingPreset } from "@/lib/booking";

type SectionId = "hero" | "services" | "proof";

type HomeClientProps = {
  initialSection?: SectionId;
};

type OfferCard = {
  id: string;
  title: string;
  count: string;
  photo: string;
  alt: string;
  objectPosition: string;
  linkLabel: string;
  preset: string;
  lead?: string;
  artists?: readonly string[];
  orgsLead?: string;
  orgs?: readonly string[];
  close?: string;
  copy?: string;
  scrollLink?: string;
  copyAfter?: string;
};

const OFFER_CARDS: readonly OfferCard[] = [
  {
    id: "drummer",
    title: "Drummer",
    count: `${Math.floor(STATS.performances / 10) * 10}+ shows`,
    photo: "/photos/epk-whitehall-2025.jpg",
    alt: "Anthony Dake behind the kit at the Whitehall Food Truck Festival, 2025",
    objectPosition: "center 35%",
    lead: "I've had the honor of opening for En Vogue, playing the main stages at Columbus Pride and ComFest, and sharing the stage with",
    artists: STAGE_ARTISTS,
    orgsLead: "and performing with",
    orgs: ORGANIZATIONS,
    close: "Tours, fly dates, and sessions — remote or in your room.",
    linkLabel: "Book a date →",
    preset: "Live show / tour date",
  },
  {
    id: "producer",
    title: "Producer",
    count: `${Math.floor(STATS.placements / 10) * 10}+ records`,
    photo: "/photos/epk-hybrid-rig-2025.jpg",
    alt: "Anthony Dake playing a hybrid acoustic and electronic rig, 2025",
    objectPosition: "top",
    copy: "Whole songs start to finish, or just the drums. ",
    scrollLink: "Hear the released records below",
    copyAfter: " — I work remote and deliver release-ready stems.",
    linkLabel: "Send a brief →",
    preset: "Production / drum programming",
  },
];

function NameList({ names }: { names: readonly string[] }) {
  return (
    <p className="mt-2 text-[15px] leading-[1.75] text-[#F2F2F2]">
      {names.map((name, i) => (
        <span key={name}>
          <span className="whitespace-nowrap">{name}</span>
          {i < names.length - 1 && (
            <span aria-hidden="true" className="text-[#5C5C5C]"> · </span>
          )}
        </span>
      ))}
    </p>
  );
}

export default function HomeClient({
  initialSection = "hero",
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

  const scrollToProof = () => {
    if (!proofRef.current) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    proofRef.current.scrollIntoView({
      block: "start",
      behavior: reduced ? "auto" : "smooth",
    });
  };

  return (
    <div className="bg-black">
      <section
        ref={heroRef}
        data-id="hero"
        className="relative -mt-14 bg-black md:mt-0 md:flex md:min-h-[calc(100svh-3.5rem)] md:flex-col md:justify-center md:pb-12"
      >
        <div className="md:mx-auto md:grid md:w-full md:max-w-[1200px] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center md:gap-12 md:px-8 md:py-10 short:py-4 tiny:py-2">
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
            <p className="mt-3 text-[22px] font-semibold leading-[1.2] text-[#F2F2F2] sm:text-[26px]">
              Producer / Drummer
            </p>
            <p className="mx-auto mt-3 max-w-[34ch] text-[17px] leading-[1.5] text-[#F2F2F2] sm:text-[18px] short:max-w-[40ch]">
              Drummer and producer for live shows, sessions, and records. Columbus, OH.
            </p>
            <p className="mt-6 text-[15px] text-[#9A9A9A] short:mt-4">
              Let&apos;s build your next record or show.
            </p>
            <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => openBookingPreset("Production / drum programming")}
                className="epk-cta min-w-[220px]"
              >
                Book production →
              </button>
              <button
                type="button"
                onClick={() => openBookingPreset("Live show / tour date")}
                className="epk-cta min-w-[220px]"
              >
                Book drums →
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
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="text-[20px] text-[#F2F2F2]">{card.title}</h3>
                <span className="text-[15px] tabular-nums text-[#9A9A9A]">{card.count}</span>
              </div>
              {card.lead && (
                <p className="mt-2 text-[15px] leading-[1.6] text-[#9A9A9A]">{card.lead}</p>
              )}
              {card.artists && <NameList names={card.artists} />}
              {card.orgsLead && (
                <p className="mt-4 text-[15px] leading-[1.6] text-[#9A9A9A]">{card.orgsLead}</p>
              )}
              {card.orgs && <NameList names={card.orgs} />}
              {card.close && (
                <p className="mt-4 text-[15px] leading-[1.6] text-[#9A9A9A]">{card.close}</p>
              )}
              {card.copy && (
                <p className="mt-2 text-[15px] leading-[1.6] text-[#9A9A9A]">
                  {card.copy}
                  {card.scrollLink && (
                    <button
                      type="button"
                      onClick={scrollToProof}
                      className="text-[#F2F2F2] underline-offset-4 hover:underline"
                    >
                      {card.scrollLink}
                    </button>
                  )}
                  {card.copyAfter}
                </p>
              )}
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
        id="proof"
        data-id="proof"
        className="mx-auto max-w-[640px] px-6 py-16 sm:py-24"
      >
        <h2 className="mb-1 text-[15px] text-[#F2F2F2]">Full productions</h2>
        <p className="text-[12px] text-[#5C5C5C]">
          Songs I produced start to finish. Tap to play.
        </p>
        <div className="mt-5">
          <ProductionRows items={PRODUCTIONS} />
        </div>
        <p className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-[#F2F2F2]">
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
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => openBookingPreset("Production / drum programming")}
            className="epk-cta min-w-[220px]"
          >
            Book production →
          </button>
          <button
            type="button"
            onClick={() => openBookingPreset("Live show / tour date")}
            className="epk-cta min-w-[220px]"
          >
            Book drums →
          </button>
        </div>
      </section>

      <FooterLine />
    </div>
  );
}
