import type { Metadata } from "next";
import BookClient from "./page.client";

export const metadata: Metadata = {
  title: "Book a Session — Anthony Dake",
  description:
    "Book a production, session drums, or songwriting session with Anthony Dake. Free 15-minute discovery call available.",
  alternates: {
    canonical: "/book",
  },
  openGraph: {
    title: "Book a Session — Anthony Dake",
    description:
      "Book a production, session drums, or songwriting session with Anthony Dake.",
    url: "/book",
    images: [
      { url: "/hero.jpg", width: 1536, height: 1024, alt: "Anthony Dake" },
    ],
  },
  twitter: {
    title: "Book a Session — Anthony Dake",
    description:
      "Book a production, session drums, or songwriting session with Anthony Dake.",
    images: ["/hero.jpg"],
  },
};

export default function Page() {
  return <BookClient />;
}
