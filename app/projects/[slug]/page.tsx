import type { Metadata } from "next";
import JsonLd from "@/app/components/JsonLd";
import ProjectDetailClient from "./page.client";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const title = "PROJECT TITLE";
  const description = "Project detail.";
  const image = "/hero.jpg";

  return {
    title,
    description,
    openGraph: {
      title: `${title} — Anthony Dake`,
      description,
      url: `/projects/${slug}`,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${siteUrl}/projects/${slug}#creativework`,
    name: "PROJECT TITLE",
    description: "Project detail.",
    url: `${siteUrl}/projects/${slug}`,
    creator: { "@id": `${siteUrl}/#person` },
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ProjectDetailClient />
    </>
  );
}
