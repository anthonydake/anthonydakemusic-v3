"use client";

import { useState } from "react";

const VIDEO_ID = "gwNaFJyhTXo";
const WATCH_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;
const EMBED_URL = `https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
const THUMB_URL = `https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`;

export default function HomeReel() {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="mx-auto max-w-[960px] px-6 pb-16 sm:pb-24">
      <h2 className="mb-6 text-[15px] text-[#F2F2F2]">Watch</h2>
      {playing ? (
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
          <iframe
            className="h-full w-full"
            src={EMBED_URL}
            title="Anthony Dake — demo reel"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <a
          href={WATCH_URL}
          target="_blank"
          rel="noopener"
          onClick={(e) => {
            e.preventDefault();
            setPlaying(true);
          }}
          className="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-black"
          aria-label="Play demo reel"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={THUMB_URL}
            alt="Anthony Dake — demo reel"
            loading="lazy"
            className="h-full w-full object-cover"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#F2F2F2] transition-colors group-hover:bg-[#E6E6E6]"
          >
            <svg viewBox="0 0 20 20" className="ml-1 h-6 w-6 fill-black" aria-hidden="true">
              <path d="M6 4.5v11l10-5.5L6 4.5z" />
            </svg>
          </span>
        </a>
      )}
      <p className="mt-3 text-[12px] text-[#5C5C5C]">Demo reel · live and studio</p>
    </section>
  );
}
