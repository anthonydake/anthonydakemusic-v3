import type { Metadata } from "next";
import HomePageClient from "./page.client";

export const metadata: Metadata = {
  title: "ANTHONY DAKE | DRUMS",
  description: "Session drummer and music director — live shows, tours, and studio sessions.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ANTHONY DAKE | DRUMS",
    description: "Session drummer and music director — live shows, tours, and studio sessions.",
    url: "/",
    images: [{ url: "/hero.jpg", width: 1536, height: 1024, alt: "Anthony Dake" }],
  },
  twitter: {
    title: "ANTHONY DAKE | DRUMS",
    description: "Session drummer and music director — live shows, tours, and studio sessions.",
    images: ["/hero.jpg"],
  },
};

export default function Page() {
  return <HomePageClient />;
}
