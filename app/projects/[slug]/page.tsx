import type { Metadata } from "next";
import JsonLd from "@/app/components/JsonLd";
import ProjectDetailClient from "./page.client";
import { projects, type ProjectMedia } from "@/lib/projects";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function pickOgImage(media: ProjectMedia[]) {
  const img = media.find((m) => m.kind === "image");
  if (img && img.kind === "image") return img.src;
  return "/hero.jpg";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  const title = project ? `${project.title}` : "Project";
  const description = project?.blurb ?? "Project detail.";
  const image = project ? pickOgImage(project.media) : "/hero.jpg";

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
  const project = projects.find((p) => p.slug === slug) || null;

  const jsonLd = project
    ? {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "@id": `${siteUrl}/projects/${project.slug}#creativework`,
        name: project.title,
        description: project.blurb,
        url: `${siteUrl}/projects/${project.slug}`,
        datePublished: `${project.year}-01-01`,
        creator: { "@id": `${siteUrl}/#person` },
      }
    : null;

  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd} /> : null}
      <ProjectDetailClient />
    </>
  );
}

