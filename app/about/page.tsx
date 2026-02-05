import type { Metadata } from "next";
import AboutPageClient from "./page.client";

export const metadata: Metadata = {
  title: "About — Anthony Dake",
  description: "Services and overview for Anthony Dake — Producer / Drummer / Music Director.",
  openGraph: {
    title: "About — Anthony Dake",
    description: "Services and overview for Anthony Dake — Producer / Drummer / Music Director.",
    url: "/about",
    images: [{ url: "/hero.jpg", width: 1536, height: 1024, alt: "Anthony Dake" }],
  },
  twitter: {
    title: "About — Anthony Dake",
    description: "Services and overview for Anthony Dake — Producer / Drummer / Music Director.",
    images: ["/hero.jpg"],
  },
};

export default function Page() {
  return <AboutPageClient />;
}
