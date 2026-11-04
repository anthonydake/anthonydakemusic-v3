import Link from "next/link";
import SiteHeader from "./components/SiteHeader";
import FooterLine from "./components/FooterLine";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        id="main-content"
        className="flex min-h-[70vh] flex-col items-center justify-center bg-black px-6 pt-24 text-[#F2F2F2]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/mark.svg" alt="" width={64} height={64} className="mb-6 opacity-90" />
        <p className="text-[15px] text-[#9A9A9A]">This page doesn&apos;t exist.</p>
        <Link href="/" className="mt-6 text-[15px] text-[#F2F2F2] hover:text-[#9A9A9A] transition-colors">
          Home →
        </Link>
      </main>
      <FooterLine />
    </>
  );
}
