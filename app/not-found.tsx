import Link from "next/link";
import SiteHeader from "./components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6">
        <span className="text-6xl mb-6">🥁</span>
        <h1 className="text-2xl font-light tracking-widest uppercase mb-4">
          <span>Page not found</span>
        </h1>
        <p className="text-white/50 text-sm tracking-wider uppercase mb-8">
          <span>This page doesn&#39;t exist — but the music does.</span>
        </p>
        <Link
          href="/"
          className="border border-white/20 rounded-full px-8 py-3 text-sm uppercase tracking-widest hover:bg-white/10 transition-colors"
        >
          <span>Go Home</span>
        </Link>
        <nav aria-label="Site sections" className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
          <Link href="/placements" className="hover:text-white/70 transition-colors">Placements</Link>
          <Link href="/performance" className="hover:text-white/70 transition-colors">Performance</Link>
          <Link href="/practice" className="hover:text-white/70 transition-colors">Practice</Link>
          <Link href="/epk" className="hover:text-white/70 transition-colors">EPK</Link>
          <Link href="/about" className="hover:text-white/70 transition-colors">About</Link>
        </nav>
      </main>
    </>
  );
}
