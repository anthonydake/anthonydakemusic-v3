import type { Metadata } from "next";
import JsonLd from "../components/JsonLd";
import ProjectsIndexClient from "./page.client";
import { projectIndex } from "@/data/projects.data";

export const metadata: Metadata = {
  title: "Projects — Anthony Dake",
  description: "Project index — production, drums, and musical direction credits and work.",
  openGraph: {
    title: "Projects — Anthony Dake",
    description: "Project index — production, drums, and musical direction credits and work.",
    url: "/projects",
    images: [{ url: "/hero.jpg", width: 1536, height: 1024, alt: "Anthony Dake" }],
  },
  twitter: {
    title: "Projects — Anthony Dake",
    description: "Project index — production, drums, and musical direction credits and work.",
    images: ["/hero.jpg"],
  },
};

export default function Page() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.anthonydakemusic.com";
  const items = [...projectIndex].map((p) => ({
    "@type": "CreativeWork",
    name: `${p.artist} — ${p.title}`,
    url: `${siteUrl}/projects/${p.slug}`,
    datePublished: `${p.year}-01-01`,
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Project Index",
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
