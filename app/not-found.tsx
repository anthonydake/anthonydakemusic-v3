import Link from "next/link";
import SiteHeader from "./components/SiteHeader";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-6">
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
      </main>
    </>
  );
}
