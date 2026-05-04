"use client";

import SiteHeader from "../components/SiteHeader";

export default function DemoReelClient() {
  return (
    <>
      <div className="edge-glow" />
      <SiteHeader />
      <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 pt-20 pb-16">
        <h1 className="mb-8 text-center text-[28px] sm:text-[36px] md:text-[44px] font-light tracking-[-0.02em] text-[#F2F2F2]">
          Demo Reel
        </h1>

        {/* YouTube Embed */}
        <div className="w-full max-w-[800px] aspect-video rounded-xl overflow-hidden bg-[#111] border border-white/10 shadow-2xl">
          <iframe
            className="h-full w-full"
            src="https://www.youtube.com/embed/mu4i9_plICo?rel=0&modestbranding=1&color=white"
            title="Anthony Dake — Demo Reel"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>

        <p className="mt-8 text-center text-[12px] uppercase tracking-[0.2em] text-white/30">
          Live Drums &bull; Session Drums
        </p>
      </main>
    </>
  );
}
