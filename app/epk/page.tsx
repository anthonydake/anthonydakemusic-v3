import { Metadata } from "next";
import EPKClient from "./page.client";

export const metadata: Metadata = {
  title: "EPK",
  description: "Anthony Dake — Electronic Press Kit. Demo reel, resume, and contact for booking.",
  alternates: { canonical: "/epk" },
  openGraph: {
    title: "ANTHONY DAKE | EPK",
    description: "Electronic press kit — demo reel, resume, and booking contact for drummer Anthony Dake.",
    url: "/epk",
    images: [{ url: "/hero.jpg", width: 1536, height: 1024, alt: "Anthony Dake" }],
  },
  twitter: {
    title: "ANTHONY DAKE | EPK",
    description: "Electronic press kit — demo reel, resume, and booking contact for drummer Anthony Dake.",
    images: ["/hero.jpg"],
  },
};

export default function EPKPage() {
  return <EPKClient />;
}
