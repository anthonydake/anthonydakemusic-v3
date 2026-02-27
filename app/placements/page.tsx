import type { Metadata } from "next";
import JsonLd from "../components/JsonLd";
import ProjectsIndexClient from "./page.client";
import { projectIndex } from "@/data/projects.data";

export const metadata: Metadata = {
  title: "Placements — Anthony Dake",
  description: "Placements index — production, drums, and musical direction credits and work.",
  alternates: {
    canonical: "/placements",
  },
  openGraph: {
    title: "Placements — Anthony Dake",
    description: "Placements index — production, drums, and musical direction credits and work.",
    url: "/placements",
    images: [{ url: "/hero.jpg", width: 1536, height: 1024, alt: "Anthony Dake" }],
  },
  twitter: {
    title: "Placements — Anthony Dake",
    description: "Placements index — production, drums, and musical direction credits and work.",
    images: ["/hero.jpg"],
  },
};

export default function Page() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.anthonydakemusic.com";
  const items = [...projectIndex].map((p) => ({
    "@type": "CreativeWork",
    name: `${p.artist} — ${p.title}`,
    url: `${siteUrl}/placements/${p.slug}`,
    datePublished: `${p.year}-01-01`,
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Placements Index",
          itemListElement: items.map((item, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            item,
          })),
        }}
      />
      <ProjectsIndexClient />
    </>
  );
}
