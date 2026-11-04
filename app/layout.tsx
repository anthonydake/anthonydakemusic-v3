// build-ts: 2026-05-02T23:23:45.831760
import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";
import JsonLd from "./components/JsonLd";
import TransitionProvider from "./components/TransitionProvider";
import { Analytics } from "@vercel/analytics/react";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.anthonydakemusic.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Anthony Dake — Session Drummer (Columbus, OH)",
    template: "%s · Anthony Dake — Session Drummer",
  },
  description:
    "Anthony Dake — session drummer based in Columbus, Ohio. Live drums and studio sessions for independent artists, festivals, and theater.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Anthony Dake",
    title: "Anthony Dake — Session Drummer (Columbus, OH)",
    description:
      "Session drummer for independent artists, festivals, and theater. Live drums and studio sessions.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Anthony Dake — live drums, session drums, music direction",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anthony Dake — Session Drummer (Columbus, OH)",
    description:
      "Session drummer for independent artists, festivals, and theater. Live drums and studio sessions.",
    images: ["/og-image.jpg"],
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
    <html lang="en" className={`bg-white ${fraunces.variable}`}>
      <head>
        <link rel="me" href="https://www.tiktok.com/@anthony_dake" />
        <link rel="me" href="https://www.youtube.com/@anthony_dake" />
        <link rel="me" href="mailto:adakemusic@gmail.com" />
        <link rel="author" href={`${siteUrl}/about`} />
      </head>
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
          <Analytics />
        </TransitionProvider>
      </body>
    </html>
  );
}
