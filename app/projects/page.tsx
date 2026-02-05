import type { Metadata } from "next";
import ProjectsPlaceholder from "./page.client";

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
  return <ProjectsPlaceholder />;
}
