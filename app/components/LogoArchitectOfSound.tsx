"use client";

// Hero name lockup. Gill Sans Light (Cabin fallback) with the one allowed
// gradient per page (`.grad`). The hero photo is rendered by the caller
// directly above this component.
export default function LogoArchitectOfSound() {
  return (
    <div className="relative inline-flex w-full max-w-[640px] lg:max-w-[820px] xl:max-w-[960px] flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="grad font-display text-[46px] leading-[1.05] tracking-[-0.015em] sm:text-[60px] md:text-[64px]">
          Anthony Dake
        </h1>
      </div>
    </div>
  );
}
