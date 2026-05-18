import type { Metadata } from "next";
import ProjectsIndexClient from "./page.client";

export const metadata: Metadata = {
  title: "PLACEMENTS",
  description: "Drum credits — live drums and drum programming across records and projects.",
  alternates: {
    canonical: "/placements",
  },
  openGraph: {
    title: "ANTHONY DAKE | PLACEMENTS",
    description: "Drum credits — live drums and drum programming across records and projects.",
    url: "/placements",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Anthony Dake" }],
  },
  twitter: {
    title: "ANTHONY DAKE | PLACEMENTS",
    description: "Drum credits — live drums and drum programming across records and projects.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <ProjectsIndexClient />;
}
