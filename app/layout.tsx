import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "./components/CustomCursor";
import JsonLd from "./components/JsonLd";
import TransitionProvider from "./components/TransitionProvider";
import LenisProvider from "./components/LenisProvider";

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
              },
              {
                "@type": "Organization",
                "@id": `${siteUrl}/#organization`,
                name: "Anthony Dake",
                url: siteUrl,
                email: "booking@anthonydakemusic.com",
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
          <LenisProvider>
            <main>{children}</main>
          </LenisProvider>
        </TransitionProvider>
      </body>
    </html>
  );
}
