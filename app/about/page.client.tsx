"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SiteHeader from "../components/SiteHeader";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.15 + i * 0.12,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export default function AboutClient() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#111113] pt-14">
        <div ref={sectionRef} className="mx-auto max-w-3xl px-6 py-20">
          {/* Editorial intro */}
          <motion.div
            initial="hidden"
            animate={visible ? "visible" : "hidden"}
            className="space-y-8"
          >
            <motion.p
              custom={0}
              variants={fadeUp}
              className="text-[11px] uppercase tracking-[0.35em] text-black/50"
            >
              About
            </motion.p>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-3xl tracking-[0.06em] text-black sm:text-4xl md:text-5xl"
            >
              The sound is the blueprint.
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="max-w-2xl text-[17px] leading-8 text-black/65"
            >
              I&apos;m Anthony Dake — a producer, drummer, and music director
              based in Columbus, Ohio. I build records from the rhythm up:
              production, songwriting, session drums, and full musical
              direction for artists who want architecture in their sound, not
              just a beat underneath it.
            </motion.p>

            <motion.p
              custom={3}
              variants={fadeUp}
              className="max-w-2xl text-[17px] leading-8 text-black/65"
            >
              My approach starts at the drums — the foundation of every
              arrangement I touch. Whether I&apos;m writing a boom bap beat,
              cutting a funk-pop record, or scoring something cinematic, the
              groove is the architecture everything else sits on. Space is
              intentional. Emotion is engineered. Every track has a reason.
            </motion.p>
          </motion.div>

          {/* Hard facts */}
          <motion.div
            initial="hidden"
            animate={visible ? "visible" : "hidden"}
            className="mt-20 space-y-16"
          >
            {/* Education & DCI */}
            <motion.div custom={4} variants={fadeUp} className="space-y-4">
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
            </motion.div>

            {/* Columbus scene */}
            <motion.div custom={5} variants={fadeUp} className="space-y-4">
              <h2 className="text-[11px] uppercase tracking-[0.35em] text-black/50">
                Columbus, Ohio
              </h2>
              <p className="text-[15px] leading-7 text-black/60">
                Columbus is home base. I&apos;ve worked with artists across
                the city&apos;s hip-hop, R&amp;B, and indie scenes — from
                production and songwriting sessions to live shows at venues
                across the metro. The Columbus community is where everything
                started and where I keep building.
              </p>
            </motion.div>

            {/* Production philosophy */}
            <motion.div custom={6} variants={fadeUp} className="space-y-4">
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
            </motion.div>

            {/* Live performance */}
            <motion.div custom={7} variants={fadeUp} className="space-y-4">
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
            </motion.div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial="hidden"
            animate={visible ? "visible" : "hidden"}
            className="mt-20 border-t border-white/10 pt-12"
          >
            <motion.div custom={8} variants={fadeUp} className="space-y-6">
              <h2 className="text-2xl tracking-[0.04em] text-black">
                Let&apos;s work.
              </h2>
              <p className="text-[15px] leading-7 text-black/60">
                If you&apos;re looking for a producer, drummer, or music
                director who builds records with intention — I&apos;d love to
                hear about your project.
              </p>
              <Link
                href="/book"
                className="book-session-cta mt-2 inline-flex items-center justify-center rounded-full px-8 py-3.5 text-[11px] uppercase tracking-[0.3em] font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                Book a Session
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </>
  );
}
