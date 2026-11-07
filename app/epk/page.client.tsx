"use client";

import Image from "next/image";
import SiteHeader from "../components/SiteHeader";
import AudioShowcase from "../components/AudioShowcase";
import FooterLine from "../components/FooterLine";

const EPK_PHOTOS = [
  {
    src: "/photos/epk-comfest-2024.jpg",
    alt: "Anthony Dake drumming on the ComFest main stage in Columbus, 2024",
    caption: "ComFest · Columbus · 2024",
  },
  {
    src: "/photos/epk-whitehall-2025.jpg",
    alt: "Anthony Dake on stage at the Whitehall Food Truck Festival, opening for En Vogue, 2025",
    caption: "Whitehall Food Truck Festival · opening for En Vogue · 2025",
  },
  {
    src: "/photos/epk-hybrid-rig-2025.jpg",
    alt: "Anthony Dake playing a hybrid acoustic and electronic rig with a Roland SPD-SX for Louis Pettinelli Entertainment, 2025",
    caption: "Hybrid rig · Louis Pettinelli Entertainment · 2025",
  },
];

export default function EPKClient() {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto max-w-[760px] bg-black px-6 pt-24 pb-16 text-[#F2F2F2] sm:px-8"
      >
        <header className="mb-10 text-center">
          <h1 className="grad font-display text-[44px] leading-tight tracking-[-0.015em] sm:text-[58px]">
            Press kit
          </h1>
        </header>

        <div className="mb-12 flex justify-center">
          <a
            href="/Anthony_Dake_One-Sheet.pdf"
            download
            target="_blank"
            rel="noopener"
            className="epk-cta"
          >
            One-sheet (PDF) →
          </a>
        </div>

        <div className="mx-auto mb-12 aspect-video w-full max-w-[760px] overflow-hidden rounded-xl border border-white/[0.08] bg-black">
          <iframe
            className="h-full w-full"
            src="https://www.youtube.com/embed/gwNaFJyhTXo?playsinline=1&rel=0&modestbranding=1&color=white"
            title="Anthony Dake — Demo Reel"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>

        <ul className="mx-auto mb-12 grid max-w-[760px] grid-cols-3 gap-3 sm:gap-4">
          {EPK_PHOTOS.map((p) => (
            <li key={p.src}>
              <figure className="flex flex-col items-center">
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={1200}
                  height={1500}
                  sizes="(max-width: 640px) 33vw, 240px"
                  className="aspect-[4/5] w-full rounded-2xl object-cover"
                  loading="lazy"
                />
                <figcaption className="mt-2 text-center text-[12px] leading-[1.4] text-[#5C5C5C]">
                  {p.caption}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <section className="mb-12 text-center">
          <h2 className="mb-4 text-[15px] text-[#F2F2F2]">Listen</h2>
          <p className="mb-5 text-[12px] text-[#5C5C5C]">Drums and production on every track.</p>
          <AudioShowcase />
        </section>

        <section className="text-center">
          <h2 className="mb-4 text-[15px] text-[#F2F2F2]">Contact</h2>
          <p className="text-[15px] leading-[1.6] text-[#9A9A9A]">
            <a
              href="mailto:adakemusic@gmail.com"
              className="text-[#F2F2F2] hover:text-[#9A9A9A] transition-colors"
            >
              adakemusic@gmail.com
            </a>
          </p>
          <p className="mt-1 text-[15px] leading-[1.6] text-[#9A9A9A]">
            Columbus, OH · fly dates nationwide
          </p>
          <p className="mt-1 text-[15px] leading-[1.6] text-[#9A9A9A]">
            <a
              href="tel:+17856082604"
              className="text-[#F2F2F2] hover:text-[#9A9A9A] transition-colors"
            >
              785.608.2604
            </a>
          </p>
        </section>
      </main>
      <FooterLine />
    </>
  );
}
