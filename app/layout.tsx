import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "./components/CustomCursor";
import JsonLd from "./components/JsonLd";
import TransitionProvider from "./components/TransitionProvider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.anthonydakemusic.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Anthony Dake — Architect of Sound",
    template: "%s",
  },
  description: "Producer / Drummer / Music Director",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Anthony Dake",
    title: "Anthony Dake — Architect of Sound",
    description: "Producer / Drummer / Music Director",
    images: [{ url: "/hero.jpg", width: 1536, height: 1024, alt: "Anthony Dake" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anthony Dake — Architect of Sound",
    description: "Producer / Drummer / Music Director",
    images: ["/hero.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white">
      <body className="antialiased bg-white text-black">
        <CustomCursor />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Person",
                "@id": `${siteUrl}/#person`,
                name: "Anthony Dake",
                url: siteUrl,
                jobTitle: "Producer / Drummer / Music Director",
                description: "Music producer, drummer, and music director based in Columbus, Ohio.",
                knowsAbout: ["Music Production", "Drumming", "Music Direction", "Playback Systems"],
                areaServed: "Columbus, Ohio",
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
          <main className="min-h-screen">{children}</main>
        </TransitionProvider>
      </body>
    </html>
  );
}
