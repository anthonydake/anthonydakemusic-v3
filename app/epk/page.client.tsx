"use client";

import SiteHeader from "../components/SiteHeader";
import AudioShowcase from "../components/AudioShowcase";
import FooterLine from "../components/FooterLine";

export default function EPKClient() {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="page-fade-in mx-auto max-w-[760px] bg-black px-6 pt-24 pb-16 text-[#F2F2F2] sm:px-8"
      >
        <header className="mb-10 text-center">
          <h1 className="grad font-serif-display text-[40px] leading-tight tracking-[-0.02em] sm:text-[52px]">
            Press kit
          </h1>
        </header>

        <div className="mb-12 flex justify-center">
          <a href="/Anthony_Dake_Resume.pdf" download className="epk-cta">
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

        <section className="mb-12 text-center">
          <h2 className="mb-4 text-[15px] text-[#F2F2F2]">Listen</h2>
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
        </section>
      </main>
      <FooterLine />
    </>
  );
}
