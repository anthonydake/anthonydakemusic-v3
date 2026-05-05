import { Metadata } from "next";
import EPKClient from "./page.client";

export const metadata: Metadata = {
  title: "EPK",
  description:
    "Anthony Dake — Electronic Press Kit. Demo reel, resume, and contact for booking.",
  alternates: { canonical: "/epk" },
};

export default function EPKPage() {
  return <EPKClient />;
}
