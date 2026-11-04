"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { performanceIndex, type PerformanceItem } from "@/data/performance.data";
import { STATS } from "@/data/stats";
import SiteHeader from "@/app/components/SiteHeader";
import FooterLine from "@/app/components/FooterLine";
import JsonLd from "@/app/components/JsonLd";

const SITE_URL = "https://www.anthonydakemusic.com";

function performanceSchema(items: PerformanceItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Anthony Dake — Live Performance Credits",
    description:
      "Curated live performance credits — drums for hip-hop sets, festival mainstages, and theater productions.",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "MusicEvent",
        name: `${p.primaryArtist} at ${p.venue}`,
        startDate: `${p.year}-01-01`,
        performer: [
          { "@type": "MusicGroup", name: p.primaryArtist },
          { "@type": "Person", name: "Anthony Dake", roleName: "Drums" },
        ],
        location: {
          "@type": "Place",
          name: p.venue,
          address: {
            "@type": "PostalAddress",
            addressLocality: p.city,
            addressRegion: p.state,
            addressCountry: "US",
          },
        },
        ...(p.youtubeUrl ? { sameAs: p.youtubeUrl, url: p.youtubeUrl } : {}),
      },
    })),
  };
}

function breadcrumbsSchema(label: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
      { "@type": "ListItem", position: 2, name: label, item: SITE_URL + path },
    ],
  };
}

export default function PerformanceClient() {
  const items = performanceIndex;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="bg-black text-[#F2F2F2]">
      <JsonLd data={performanceSchema(items)} />
      <JsonLd data={breadcrumbsSchema("Performance", "/performance")} />
      <SiteHeader />
      <main
        id="main-content"
        className={`page-fade-in mx-auto max-w-[960px] px-6 pt-24 pb-16 transition-opacity duration-300 ease-out sm:px-8 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="sr-only">
          Live performance credits — drums for hip-hop sets, festival mainstages, theater productions. The list below is {items.length} curated highlights; the full career spans roughly {STATS.performances} documented performances since 2017, including DCI tours with Blue Knights, WGI seasons with Rhythm X and Dojo Percussion, marching band, jazz and percussion ensembles, and recent professional gigs across Columbus, Ohio.
        </p>

        <header className="mb-10">
          <h1 className="grad font-serif-display text-[40px] leading-tight tracking-[-0.02em] sm:text-[52px]">
            Performance
          </h1>
          <p className="mt-2 text-[15px] text-[#9A9A9A]">
            Selected · {items.length} of ~{STATS.performances}
          </p>
        </header>

        <YearGroups items={items} />

        <nav
          aria-label="Related sections"
          className="mt-14 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-[#F2F2F2]"
        >
          <Link href="/placements" className="hover:text-[#9A9A9A] transition-colors">
            Placements →
          </Link>
          <Link href="/epk" className="hover:text-[#9A9A9A] transition-colors">
            Press kit →
          </Link>
        </nav>
      </main>
      <FooterLine />
    </div>
  );
}

function YearGroups({ items }: { items: PerformanceItem[] }) {
  const years = Array.from(new Set(items.map((p) => p.year))).sort((a, b) => b - a);

  return (
    <div className="space-y-10">
      {years.map((year) => {
        const yearItems = items.filter((p) => p.year === year);
        return (
          <section key={year} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-[0.18em] text-[#5C5C5C]">
                {year}
              </span>
              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>
            <ul className="divide-y divide-white/[0.06]">
              {yearItems.map((p) => {
                const venueLocation = `${p.venue}, ${p.city}, ${p.state}`;
                const Row = (
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-baseline gap-x-6 py-3">
                    <span className="text-[15px] text-[#F2F2F2]">{p.primaryArtist}</span>
                    <span className="text-[15px] text-[#9A9A9A] transition-colors group-hover:text-[#F2F2F2]">
                      {venueLocation}
                    </span>
                  </div>
                );
                if (p.youtubeUrl) {
                  return (
                    <li key={p.id}>
                      <a
                        href={p.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                      >
                        {Row}
                      </a>
                    </li>
                  );
                }
                return <li key={p.id}>{Row}</li>;
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
