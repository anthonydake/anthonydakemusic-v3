import { Metadata } from "next";
import DemoReelClient from "./page.client";

export const metadata: Metadata = {
  title: "Demo Reel — Anthony Dake",
  description: "Watch Anthony Dake's drumming demo reel — live performance and session highlights.",
  alternates: { canonical: "/demoreel" },
};

export default function DemoReelPage() {
  return <DemoReelClient />;
}
