"use client";

// Hero name lockup. Fraunces 300 with the one allowed gradient per page
// (`.grad`). The hero portrait (when shown) is rendered by the caller
// directly above this component.
export default function LogoArchitectOfSound() {
  return (
    <div className="relative inline-flex w-full max-w-[640px] lg:max-w-[820px] xl:max-w-[960px] flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="grad font-serif-display text-[36px] sm:text-[48px] md:text-[58px] tracking-[-0.02em] leading-tight">
          anthony dake
        </h1>
      </div>
    </div>
  );
}
