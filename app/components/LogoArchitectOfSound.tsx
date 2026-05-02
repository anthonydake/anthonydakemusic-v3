"use client";

import { useState } from "react";
import TextScramble from "./TextScramble";

export default function LogoArchitectOfSound() {
  const [run, setRun] = useState(0);
  const retrigger = () => setRun((n) => n + 1);

  return (
    <div
      className="relative inline-flex w-full max-w-[640px] flex-col items-center justify-center py-4 text-[#F2F2F2]"
      onMouseEnter={retrigger}
      onMouseLeave={retrigger}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <h1 className="text-[36px] sm:text-[48px] md:text-[58px] font-small tracking-[-0.02em] leading-tight text-[#F2F2F2]">
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

        <div className="mt-8 mb-8 sm:mt-10 sm:mb-10">
          <img
            src="/anthony-dake-drums.jpg"
            alt="Anthony Dake drumming at age 5"
            className="mx-auto h-[140px] w-[140px] sm:h-[160px] sm:w-[160px] md:h-[180px] md:w-[180px] rounded-lg object-cover shadow-lg"
          />
        </div>

        <div className="text-[12px] sm:text-[14px] uppercase tracking-[0.32em] text-[#A1A1A6]">
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
