"use client";


import Link from "next/link";

import SiteHeader from "../components/SiteHeader";



export default function AboutClient() {
  

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#111113] pt-14">
        <div className="mx-auto max-w-3xl px-6 py-20">
          {/* Editorial intro */}
          <div
            className="space-y-8"
          >
            <p
              className="text-[11px] uppercase tracking-[0.35em] text-black/50"
            >
              About
            </p>

            <h1
              className="text-3xl tracking-[0.06em] text-black sm:text-4xl md:text-5xl"
            >
              The sound is the blueprint.
            </h1>

            <p
              className="max-w-2xl text-[17px] leading-8 text-black/65"
            >
              I&apos;m Anthony Dake — a touring drummer and session drummer
              based in Nashville, Tennessee. I build shows and records from
              the rhythm up: session drums and full musical direction for
              artists who want their live shows to hit as hard as their
              records.
            </p>

            <p
              className="max-w-2xl text-[17px] leading-8 text-black/65"
            >
              My approach starts at the drums — the foundation of every
              arrangement I touch. Whether I&apos;m writing a boom bap beat,
              cutting a funk-pop record, or scoring something cinematic, the
              groove is the architecture everything else sits on. Space is
              intentional. Emotion is engineered. Every track has a reason.
            </p>
          </div>

          {/* Hard facts */}
          <div
            className="mt-20 space-y-16"
          >
            {/* Education & DCI */}
            <div className="space-y-4">
              <h2 className="text-[11px] uppercase tracking-[0.35em] text-black/50">
                Education &amp; Marching Arts
              </h2>
              <p className="text-[15px] leading-7 text-black/60">
                Bachelor of Music in Music Technology from Capital
                University&apos;s Conservatory of Music. Before that, years on
                the competitive marching arts circuit — Bluecoats Drum &amp;
                Bugle Corps (2020), Rhythm X Indoor Percussion (2020), Blue
                Knights Drum &amp; Bugle Corps (2017–18), Shadow Drum &amp;
                Bugle Corps (2016), and Dojo Percussion (2016). That
                background built the discipline, ear, and ensemble instinct I
                carry into every session.
              </p>
            </div>

            {/* Columbus scene */}
            <div className="space-y-4">
              <h2 className="text-[11px] uppercase tracking-[0.35em] text-black/50">
                Nashville, Tennessee
              </h2>
              <p className="text-[15px] leading-7 text-black/60">
                Nashville is home base. I&apos;ve worked with artists across
                genres — from hip-hop and R&amp;B to pop and indie — bringing
                session drums and musical direction to live shows and studio
                sessions. The Nashville community is where I keep building.
              </p>
            </div>

            {/* Production philosophy */}
            <div className="space-y-4">
              <h2 className="text-[11px] uppercase tracking-[0.35em] text-black/50">
                Production Philosophy
              </h2>
              <p className="text-[15px] leading-7 text-black/60">
                I study producers the way architects study buildings — Jack
                Antonoff&apos;s structural simplicity, Illangelo&apos;s
                atmospheric depth, Ludwig G&ouml;ransson&apos;s rhythmic
                storytelling. My reference library runs from Mobb Deep and MF
                DOOM through Harry Styles and Brian Eno. Every project gets
                its own sonic identity; I don&apos;t have a signature sound, I
                have a signature process.
              </p>
            </div>

            {/* Live performance */}
            <div className="space-y-4">
              <h2 className="text-[11px] uppercase tracking-[0.35em] text-black/50">
                Live Performance
              </h2>
              <p className="text-[15px] leading-7 text-black/60">
                On stage, I play an acoustic/electronic hybrid kit — Roland
                SPD-SX Pro integrated with acoustic drums, running Ableton
                Live for real-time triggering and effects. I&apos;ve played
                festivals (Pride Fest, Comfest, Jeni&apos;s Strawberry Jam),
                clubs, theaters, and private events. I serve as musical
                director and drummer for live artists, building the show from
                the setlist up.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div
            className="mt-20 border-t border-white/10 pt-12"
          >
            <div className="space-y-6">
              <h2 className="text-2xl tracking-[0.04em] text-black">
                Let&apos;s work.
              </h2>
              <p className="text-[15px] leading-7 text-black/60">
                If you&apos;re looking for a touring drummer, session drummer, or music
                director who builds shows and records with intention — I&apos;d love to
                hear about your project.
              </p>
              <Link
                href="/demoreel"
                className="book-session-cta mt-2 inline-flex items-center justify-center rounded-full px-8 py-3.5 text-[11px] uppercase tracking-[0.3em] font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Demo Reel
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
