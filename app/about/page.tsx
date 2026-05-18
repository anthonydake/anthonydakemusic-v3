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
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Anthony Dake" }],
  },
  twitter: {
    title: "ANTHONY DAKE | ABOUT",
    description: "From small-town church drummer to world-class performer. The story of Anthony Dake.",
    images: ["/og-image.jpg"],
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
