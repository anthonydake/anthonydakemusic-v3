import { Metadata } from "next";
import AboutClient from "./page.client";

export const metadata: Metadata = {
  title: "ABOUT",
  description: "From small-town church drummer to world-class performer. The story of Anthony Dake.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "ANTHONY DAKE | ABOUT",
    description: "From small-town church drummer to world-class performer. The story of Anthony Dake.",
    url: "/about",
    images: [{ url: "/hero.jpg", width: 1536, height: 1024, alt: "Anthony Dake" }],
  },
  twitter: {
    title: "ANTHONY DAKE | ABOUT",
    description: "From small-town church drummer to world-class performer. The story of Anthony Dake.",
    images: ["/hero.jpg"],
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
