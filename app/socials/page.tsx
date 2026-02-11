import type { Metadata } from "next";
import AboutPageClient from "../about/page.client";

export const metadata: Metadata = {
  title: "Socials — Anthony Dake",
  description: "Social links for Anthony Dake.",
  openGraph: {
    title: "Socials — Anthony Dake",
    description: "Social links for Anthony Dake.",
    url: "/socials",
    images: [{ url: "/hero.jpg", width: 1536, height: 1024, alt: "Anthony Dake" }],
  },
  twitter: {
    title: "Socials — Anthony Dake",
    description: "Social links for Anthony Dake.",
    images: ["/hero.jpg"],
  },
};

export default function Page() {
  return <AboutPageClient />;
}
