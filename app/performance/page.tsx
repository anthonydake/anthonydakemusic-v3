import type { Metadata } from "next";
import PerformanceIndexClient from "./page.client";

export const metadata: Metadata = {
  title: "PERFORMANCE",
  description: "Live performance credits — drums, percussion, and musical direction.",
  alternates: {
    canonical: "/performance",
  },
  openGraph: {
    title: "ANTHONY DAKE | PERFORMANCE",
    description: "Live performance credits — drums, percussion, and musical direction.",
    url: "/performance",
    images: [{ url: "/hero.jpg", width: 1536, height: 1024, alt: "Anthony Dake" }],
  },
  twitter: {
    title: "ANTHONY DAKE | PERFORMANCE",
    description: "Live performance credits — drums, percussion, and musical direction.",
    images: ["/hero.jpg"],
  },
};

export default function Page() {
  return <PerformanceIndexClient />;
}
