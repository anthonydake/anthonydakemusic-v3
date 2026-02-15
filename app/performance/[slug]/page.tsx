import type { Metadata } from "next";
import JsonLd from "@/app/components/JsonLd";
import PerformanceDetailClient from "./page.client";
import { performanceIndex } from "@/data/performance.data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = performanceIndex.find((p) => p.slug === slug);
  const title = item ? item.title : "Performance";
  const description = item
    ? `${item.primaryArtist} — ${item.title}. Roles: ${item.roles.join(" / ")}.`
    : "Performance detail.";
  const image = item?.photoUrls?.[0] ?? "/hero.jpg";

  return {
    title,
    description,
    alternates: {
      canonical: `/performance/${slug}`,
    },
    openGraph: {
      title: `${title} — Anthony Dake`,
      description,
      url: `/performance/${slug}`,
      images: [{ url: image, alt: title }],
    },
    twitter: {
      title: `${title} — Anthony Dake`,
      description,
      images: [image],
    },
  };
}

export default async function Page({ params }: PageProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.anthonydakemusic.com";
  const { slug } = await params;
  const item = performanceIndex.find((p) => p.slug === slug) || null;

  const jsonLd = item
    ? {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "@id": `${siteUrl}/performance/${item.slug}#creativework`,
        name: item.title,
        description: `${item.primaryArtist} — ${item.title}. Roles: ${item.roles.join(" / ")}.`,
        url: `${siteUrl}/performance/${item.slug}`,
        datePublished: `${item.dateDisplay}`,
        creator: { "@id": `${siteUrl}/#person` },
      }
    : null;
  const breadcrumbLd = item
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Performance",
            item: `${siteUrl}/performance`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: item.title,
            item: `${siteUrl}/performance/${item.slug}`,
          },
        ],
      }
    : null;

  return (
    <>
      {breadcrumbLd ? <JsonLd data={breadcrumbLd} /> : null}
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <PerformanceDetailClient />
    </>
  );
}
