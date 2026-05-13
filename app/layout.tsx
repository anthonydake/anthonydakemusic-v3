// build-ts: 2026-05-02T23:23:45.831760
import type { Metadata, Viewport } from "next";
import "./globals.css";
import JsonLd from "./components/JsonLd";
import TransitionProvider from "./components/TransitionProvider";
import { SiteFooter } from "./components/SiteFooter";
import { Analytics } from "@vercel/analytics/react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.anthonydakemusic.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ANTHONY DAKE | DRUMS",
    template: "ANTHONY DAKE | %s",
  },
  description: "Session drummer and music director — live shows, tours, and studio sessions",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Anthony Dake",
    title: "🥁 ANTHONY DAKE | DRUMS",
    description: "Session drummer and music director — live shows, tours, and studio sessions",
    images: [{ url: "/hero.jpg", width: 1536, height: 1024, alt: "Anthony Dake" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "🥁 ANTHONY DAKE | DRUMS",
    description: "Session drummer and music director — live shows, tours, and studio sessions",
    images: ["/hero.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white">
      <body className="antialiased bg-white text-black">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Person",
                "@id": `${siteUrl}/#person`,
                name: "Anthony Dake",
                url: siteUrl,
                jobTitle: "Session drummer and music director — live shows, tours, and studio sessions",
                description: "Session drummer and music director based in Columbus, OH.",
                knowsAbout: ["Session Drumming", "Live Performance", "Music Direction", "Tour Preparation"],
                areaServed: "Columbus, OH",
                sameAs: [
                  "https://www.instagram.com/anthony_dake/",
                  "https://www.tiktok.com/@anthony_dake",
                  "https://www.youtube.com/@anthony_dake",
                ],
              },
              {
                "@type": "Organization",
                "@id": `${siteUrl}/#organization`,
                name: "Anthony Dake",
                url: siteUrl,
                email: "adakemusic@gmail.com",
                contactPoint: [
                  {
                    "@type": "ContactPoint",
                    contactType: "booking",
                    email: "adakemusic@gmail.com",
                    availableLanguage: ["English"],
                  },
                ],
                sameAs: [
                  "https://www.instagram.com/anthony_dake/",
                  "https://www.tiktok.com/@anthony_dake",
                  "https://www.youtube.com/@anthony_dake",
                ],
              },
              {
                "@type": "WebSite",
                "@id": `${siteUrl}/#website`,
                url: siteUrl,
                name: "Anthony Dake",
                publisher: { "@id": `${siteUrl}/#organization` },
              },
            ],
          }}
        />
        <TransitionProvider>
          <div className="min-h-screen">{children}</div>
          <SiteFooter />
          <Analytics />
        </TransitionProvider>
      </body>
    </html>
  );
}
