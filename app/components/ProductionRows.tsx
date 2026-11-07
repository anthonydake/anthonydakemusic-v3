"use client";

import { useId, useState } from "react";
import Image from "next/image";
import JsonLd from "./JsonLd";
import type { Production } from "@/data/productions.data";

const SITE_URL = "https://www.anthonydakemusic.com";

function buildSchema(items: Production[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Anthony Dake — Full productions",
    description:
      "Songs produced start to finish by Anthony Dake — beat, arrangement, drum programming and production.",
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "MusicRecording",
        name: p.title,
        byArtist: { "@type": "MusicGroup", name: p.artist },
        datePublished: String(p.year),
        url: `https://www.youtube.com/watch?v=${p.youtubeId}`,
        image: SITE_URL + p.cover,
        producer: { "@type": "Person", name: "Anthony Dake" },
      },
    })),
  };
}

export default function ProductionRows({ items }: { items: Production[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const uid = useId();

  return (
    <>
      <JsonLd data={buildSchema(items)} />
      <ul className="w-full text-left">
        {items.map((p) => {
          const isOpen = openId === p.id;
          const panelId = `${uid}-${p.id}`;
          const watchUrl = `https://www.youtube.com/watch?v=${p.youtubeId}`;
          return (
            <li key={p.id} className="border-t border-white/[0.08] last:border-b">
              <a
                href={watchUrl}
                target="_blank"
                rel="noopener"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenId(isOpen ? null : p.id);
                }}
                className="group flex items-center gap-4 py-3 outline-none focus-visible:ring-1 focus-visible:ring-white/40"
              >
                <Image
                  src={p.cover}
                  alt={`${p.title} cover art`}
                  width={600}
                  height={600}
                  sizes="64px"
                  loading="lazy"
                  className="h-14 w-14 shrink-0 rounded-md object-cover sm:h-16 sm:w-16"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-[1.35] text-[#F2F2F2] sm:text-[16px]">
                    {p.title}
                  </p>
                  <p className="text-[13px] text-[#9A9A9A]">
                    {p.artist} · {p.year}
                  </p>
                </div>
                <span className="shrink-0 text-[12px] tabular-nums text-[#5C5C5C]">
                  {p.duration}
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.16] transition-colors group-hover:border-white/40 group-focus-visible:border-white/40"
                >
                  {isOpen ? (
                    <svg viewBox="0 0 20 20" className="h-3 w-3 stroke-[#F2F2F2]" fill="none" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M5 5l10 10M15 5L5 15" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" className="ml-0.5 h-3 w-3 fill-[#F2F2F2]">
                      <path d="M6 4.5v11l10-5.5L6 4.5z" />
                    </svg>
                  )}
                </span>
              </a>
              {isOpen ? (
                <div id={panelId} className="pb-4">
                  <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${p.youtubeId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
                      title={`${p.title} — ${p.artist}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
