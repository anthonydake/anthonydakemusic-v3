import type { Metadata } from "next";
import AboutClient from "./page.client";

export const metadata: Metadata = {
  title: "About — Anthony Dake",
  description:
    "Anthony Dake is a Columbus-based producer, drummer, and music director. Capital University Conservatory graduate, DCI veteran, and architect of sound for independent artists.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About — Anthony Dake",
    description:
      "Producer, drummer, and music director based in Columbus, Ohio.",
    url: "/about",
    images: [
      { url: "/hero.jpg", width: 1536, height: 1024, alt: "Anthony Dake" },
    ],
  },
  twitter: {
    title: "About — Anthony Dake",
    description:
      "Producer, drummer, and music director based in Columbus, Ohio.",
    images: ["/hero.jpg"],
  },
};

export default function Page() {
  return <AboutClient />;
}
