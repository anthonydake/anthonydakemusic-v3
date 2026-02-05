import type { Metadata } from "next";
import ContactPageClient from "./page.client";

export const metadata: Metadata = {
  title: "Contact — Anthony Dake",
  description: "Project inquiries for production, drums, and music direction.",
  openGraph: {
    title: "Contact — Anthony Dake",
    description: "Project inquiries for production, drums, and music direction.",
    url: "/contact",
    images: [{ url: "/hero.jpg", width: 1536, height: 1024, alt: "Anthony Dake" }],
  },
  twitter: {
    title: "Contact — Anthony Dake",
    description: "Project inquiries for production, drums, and music direction.",
    images: ["/hero.jpg"],
  },
};

export default function Page() {
  return <ContactPageClient />;
}
