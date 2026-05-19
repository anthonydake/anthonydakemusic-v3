"use client";

import { useState } from "react";
import Image from "next/image";
import TextScramble from "./TextScramble";

export default function LogoArchitectOfSound() {
  const [run, setRun] = useState(0);
  const retrigger = () => setRun((n) => n + 1);

  return (
    <div
      className="relative inline-flex w-full max-w-[640px] lg:max-w-[820px] xl:max-w-[960px] flex-col items-center justify-center py-6 text-[#F2F2F2]"
      onMouseEnter={retrigger}
      onMouseLeave={retrigger}
    >
      <div className="flex flex-col items-center justify-center text-center">
        {/* Photo on top */}
        <div className="mb-8 sm:mb-10 mx-auto h-[150px] w-[150px] sm:h-[170px] sm:w-[170px] md:h-[190px] md:w-[190px] lg:h-[220px] lg:w-[220px] xl:h-[240px] xl:w-[240px] overflow-hidden rounded-full shadow-lg">
          <Image
            src="/anthony-dake-drums.jpg"
            alt="Anthony Dake drumming at age 5"
            width={240}
            height={240}
            priority
            sizes="(max-width: 640px) 150px, (max-width: 768px) 170px, (max-width: 1024px) 190px, (max-width: 1280px) 220px, 240px"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Name */}
        <h1 className="font-serif-display text-[36px] sm:text-[48px] md:text-[58px] lg:text-[72px] xl:text-[88px] tracking-[-0.02em] leading-tight text-[#F2F2F2]">
          <TextScramble
            key={`name-${run}`}
            text="anthony dake"
            className="block"
            duration={500}
            charset="#%&$@+|"
            scrambleFraction={0.35}
            trigger={run}
          />
        </h1>

        {/* Subtitle */}
        <div className="mt-4 sm:mt-5 lg:mt-6 text-[12px] sm:text-[14px] lg:text-[16px] uppercase tracking-[0.32em] text-[#A1A1A6]">
          <TextScramble
            key={`desc-${run}`}
            text="LIVE DRUMS | SESSION DRUMS"
            duration={500}
            charset="#%&$@+|"
            scrambleFraction={0.35}
            trigger={run}
          />
        </div>
      </div>
    </div>
  );
}
