"use client";

// Hero name lockup. Gill Sans Light (Cabin fallback) with the one allowed
// gradient per page (`.grad`), plus the `Architect of Sound` moniker in a
// uppercase meta line directly below. Everything else in the hero text block
// (roles, description, invitation, pills, texts) lives in HomeClient.tsx.
export default function LogoArchitectOfSound() {
  return (
    <div className="relative inline-flex w-full max-w-[640px] lg:max-w-[820px] xl:max-w-[960px] flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="grad font-display text-[46px] leading-[1.05] tracking-[-0.015em] sm:text-[60px] md:text-[64px] short:text-[54px] tiny:text-[48px]">
          Anthony Dake
        </h1>
        <p className="mt-3 text-[12px] uppercase tracking-[0.32em] text-[#9A9A9A] sm:text-[13px]">
          Architect of Sound
        </p>
      </div>
    </div>
  );
}
