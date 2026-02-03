import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "./components/CustomCursor";

export const metadata: Metadata = {
  title: "Anthony Dake — Architect of Sound",
  description: "Producer / Drummer / Music Director",
  icons: {
    icon: "/favicon.svg",
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
        <main>{children}</main>
      </body>
    </html>
  );
}
