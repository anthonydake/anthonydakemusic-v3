"use client";

import Image from "next/image";

type Props = {
  showPortrait?: boolean;
};

// Hero name lockup. Fraunces 300 with the one allowed gradient per page
// (`.grad`). Portrait is opt-out (on by default for the standalone use,
// off in the hero where the hero no longer carries a photo).
export default function LogoArchitectOfSound({ showPortrait = true }: Props) {
  return (
    <div className="relative inline-flex w-full max-w-[640px] lg:max-w-[820px] xl:max-w-[960px] flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center">
        {showPortrait && (
          <div className="mb-8 sm:mb-10 mx-auto h-[150px] w-[150px] sm:h-[170px] sm:w-[170px] md:h-[190px] md:w-[190px] lg:h-[220px] lg:w-[220px] xl:h-[240px] xl:w-[240px] overflow-hidden rounded-full">
            <Image
              src="/anthony-dake-drums.jpg"
              alt="Anthony Dake — session drummer based in Columbus, Ohio"
              width={240}
              height={240}
              priority
              sizes="(max-width: 640px) 150px, (max-width: 768px) 170px, (max-width: 1024px) 190px, (max-width: 1280px) 220px, 240px"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <h1 className="grad font-serif-display text-[36px] sm:text-[48px] md:text-[58px] tracking-[-0.02em] leading-tight">
          anthony dake
        </h1>
      </div>
    </div>
  );
}
