import { Metadata } from "next";
import EPKClient from "./page.client";

export const metadata: Metadata = {
  openGraph: {
    title: "ANTHONY DAKE | EPK",
    description: "Electronic press kit — demo reel, resume, and booking contact for drummer Anthony Dake.",
  },
  title: "EPK",
  description:
    "Anthony Dake — Electronic Press Kit. Demo reel, resume, and contact for booking.",
  alternates: { canonical: "/epk" },
};

export default function EPKPage() {
  return <EPKClient />;
}
