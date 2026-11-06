import type { Metadata } from "next";
import HomePageClient from "./page.client";

const HOME_TITLE = "Anthony Dake — Drummer & Producer · Columbus, OH";
const HOME_DESCRIPTION =
  "Drummer and producer in Columbus, OH. Live shows, tours and fly dates, remote and in-room session drums, drum programming and production. Book direct.";
const OG_ALT = "Anthony Dake — drummer and producer, Columbus, OH";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "/",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: ["/og-image.jpg"],
  },
};

export default function Page() {
  return <HomePageClient />;
}
