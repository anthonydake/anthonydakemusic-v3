// The only React pages left are under /admin (the bookings list). Every
// public page is a whole HTML document sent by a route handler (see
// lib/site/render.ts), so this layout never wraps one of them.
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin · Anthony Dake",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-[#F2F2F2]">
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
