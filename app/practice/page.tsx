import type { Metadata } from "next";
import PracticePageClient from "./page.client";

export const metadata: Metadata = {
  title: "PRACTICE",
  description:
    "Daily practice journal — raw, unfiltered sessions from a working session drummer. Watch the process, not just the performance.",
  alternates: {
    canonical: "/practice",
  },
  openGraph: {
    title: "ANTHONY DAKE | PRACTICE",
    description:
      "Daily practice journal — raw, unfiltered sessions from a working session drummer.",
    url: "/practice",
    images: [
      { url: "/hero.jpg", width: 1536, height: 1024, alt: "Anthony Dake" },
    ],
  },
  twitter: {
    title: "ANTHONY DAKE | PRACTICE",
    description:
      "Daily practice journal — raw, unfiltered sessions from a working session drummer.",
    images: ["/hero.jpg"],
  },
};

export default function Page() {
  return <PracticePageClient />;
}
