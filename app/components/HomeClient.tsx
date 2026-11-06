"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
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
        className="flex min-h-[88svh] flex-col items-center justify-center bg-black px-6 pt-14 pb-16 text-center"
      >
        <Image
          src="/portrait.jpg"
          alt="Anthony Dake"
          width={144}
          height={144}
          priority
          className="rounded-full object-cover h-28 w-28 sm:h-36 sm:w-36 mx-auto mb-7"
        />
        <LogoArchitectOfSound />
        <p className="mx-auto mt-6 max-w-[28ch] text-[15px] leading-[1.6] text-[#9A9A9A] sm:text-[16px]">
          Drummer and producer. Live, studio, remote. Columbus, OH.
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
          ~{STATS.performances} performances · ~{STATS.placements} placements
        </p>
        <p className="mt-2 text-[15px] leading-[1.6] text-[#9A9A9A] sm:text-[16px]">
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
