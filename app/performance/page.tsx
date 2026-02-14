import type { Metadata } from "next";
import JsonLd from "../components/JsonLd";
import PerformanceIndexClient from "./page.client";
import { performanceIndex } from "@/data/performance.data";

export const metadata: Metadata = {
  title: "Performance — Anthony Dake",
  description: "Performance index — performance, drums, and musical direction credits and work.",
  alternates: {
    canonical: "/performance",
  },
  openGraph: {
    title: "Performance — Anthony Dake",
    description: "Performance index — performance, drums, and musical direction credits and work.",
    url: "/performance",
    images: [{ url: "/hero.jpg", width: 1536, height: 1024, alt: "Anthony Dake" }],
  },
  twitter: {
    title: "Performance — Anthony Dake",
    description: "Performance index — performance, drums, and musical direction credits and work.",
    images: ["/hero.jpg"],
  },
};

export default function Page() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.anthonydakemusic.com";
  const items = [...performanceIndex].map((p) => ({
    "@type": "CreativeWork",
    name: `${p.artist} — ${p.title}`,
    url: `${siteUrl}/performance/${p.slug}`,
    datePublished: `${p.year}-01-01`,
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Performance Index",
          itemListElement: items.map((item, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            item,
          })),
        }}
      />
      <PerformanceIndexClient />
    </>
  );
}
