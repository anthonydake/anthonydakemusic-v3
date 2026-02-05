import type { Metadata } from "next";
import HomePageClient from "./page.client";

export const metadata: Metadata = {
  title: "Anthony Dake — Architect of Sound",
  description: "Producer / Drummer / Music Director.",
  openGraph: {
    title: "Anthony Dake — Architect of Sound",
    description: "Producer / Drummer / Music Director.",
    url: "/",
    images: [{ url: "/hero.jpg", width: 1536, height: 1024, alt: "Anthony Dake" }],
  },
  twitter: {
    title: "Anthony Dake — Architect of Sound",
    description: "Producer / Drummer / Music Director.",
    images: ["/hero.jpg"],
  },
};

export default function Page() {
  return <HomePageClient />;
}
