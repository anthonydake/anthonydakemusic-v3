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
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Anthony Dake" }],
  },
  twitter: {
    title: "ANTHONY DAKE | PERFORMANCE",
    description: "Live performance credits — drums, percussion, and musical direction.",
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <PerformanceIndexClient />;
}
