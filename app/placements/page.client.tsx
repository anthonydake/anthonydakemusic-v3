"use client";

import Link from "next/link";
import { projectIndex, type ProjectIndexItem } from "@/data/projects.data";
import { PRODUCTIONS } from "@/data/productions.data";
import { STATS } from "@/data/stats";
import SiteHeader from "@/app/components/SiteHeader";
import FooterLine from "@/app/components/FooterLine";
import JsonLd from "@/app/components/JsonLd";
import ProductionRows from "@/app/components/ProductionRows";

const SITE_URL = "https://www.anthonydakemusic.com";

function placementsSchema(items: ProjectIndexItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Anthony Dake — Placements",
    description:
      "Curated drum credits across released records — drum performance and drum programming for independent artists.",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: items.length,
    itemListElement: items.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "MusicRecording",
        name: p.title,
        byArtist: { "@type": "MusicGroup", name: p.artist },
        datePublished: String(p.year),
        contributor: {
          "@type": "Person",
          name: "Anthony Dake",
          roleName: p.role,
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

export default function PlacementsClient() {
  const productionIds = new Set(PRODUCTIONS.map((p) => p.youtubeId));
  const drumItems = projectIndex.filter(
    (p) => !p.youtubeUrl || !Array.from(productionIds).some((id) => p.youtubeUrl!.includes(id))
  );
  const totalSelected = PRODUCTIONS.length + drumItems.length;

  return (
    <div className="bg-black text-[#F2F2F2]">
      <JsonLd data={placementsSchema(drumItems)} />
      <JsonLd data={breadcrumbsSchema("Placements", "/placements")} />
      <SiteHeader />
      <main
        id="main-content"
        className="mx-auto max-w-[960px] px-6 pt-24 pb-16 sm:px-8"
      >
        <p className="sr-only">
          Drum credits across released records since 2022 — drum performance and drum programming for independent artists, primarily in Columbus, Ohio. The list below is a curated selection of {totalSelected} highlights; the full catalog includes roughly {STATS.placements} placements with collaborators including AR!YAH, KJ The Cool Nerd, Bitty, WANYEH, and Madelyn Leona.
        </p>

        <header className="mb-10">
          <h1 className="grad font-display text-[44px] leading-tight tracking-[-0.015em] sm:text-[58px]">
            Placements
          </h1>
          <p className="mt-2 text-[15px] text-[#9A9A9A]">
            Selected · {totalSelected} of ~{STATS.placements}
          </p>
        </header>

        <section className="mb-16">
          <h2 className="mb-1 text-[15px] text-[#F2F2F2]">Full productions</h2>
          <p className="text-[12px] text-[#5C5C5C]">
            Songs I produced start to finish. Tap to play.
          </p>
          <div className="mt-5">
            <ProductionRows items={PRODUCTIONS} />
          </div>
        </section>

        <h2 className="mb-6 text-[15px] text-[#F2F2F2]">Drums &amp; drum programming</h2>
        <YearGroups items={drumItems} />

        <nav
          aria-label="Related sections"
          className="mt-14 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-[#F2F2F2]"
        >
          <Link href="/performance" className="hover:text-[#9A9A9A] transition-colors">
            Performance →
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

function YearGroups({ items }: { items: ProjectIndexItem[] }) {
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
                const Row = (
                  <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-baseline gap-x-6 py-3">
                    <span className="text-[15px] text-[#F2F2F2]">{p.artist}</span>
                    <span className="text-[15px] text-[#9A9A9A] transition-colors group-hover:text-[#F2F2F2]">
                      {p.title}
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
