import Link from "next/link";

// Single site-wide footer row. One line, hairline border on top, no columns,
// no columns of links. Social links live here now (they were removed from
// the hero + /epk in the Calm pass).
export default function FooterLine() {
  return (
    <footer className="mt-16 border-t border-white/[0.08]">
      <p className="mx-auto flex max-w-[960px] flex-wrap items-center justify-center gap-x-3 gap-y-1 px-6 py-10 text-center text-[12px] text-[#5C5C5C]">
        <span>Columbus, OH</span>
        <span aria-hidden="true">·</span>
        <a href="mailto:adakemusic@gmail.com" className="hover:text-[#F2F2F2] transition-colors">
          Email
        </a>
        <span aria-hidden="true">·</span>
        <a
          href="https://www.youtube.com/@anthony_dake"
          target="_blank"
          rel="noreferrer me"
          className="hover:text-[#F2F2F2] transition-colors"
        >
          YouTube
        </a>
        <span aria-hidden="true">·</span>
        <a
          href="https://www.tiktok.com/@anthony_dake"
          target="_blank"
          rel="noreferrer me"
          className="hover:text-[#F2F2F2] transition-colors"
        >
          TikTok
        </a>
        <span aria-hidden="true">·</span>
        <Link href="/epk" className="hover:text-[#F2F2F2] transition-colors">
          Press kit
        </Link>
      </p>
    </footer>
  );
}
