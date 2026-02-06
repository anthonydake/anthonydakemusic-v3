"use client";

import { useState } from "react";
import TextScramble from "./TextScramble";

export default function LogoArchitectOfSound() {
  const [run, setRun] = useState(0);
  const retrigger = () => setRun((n) => n + 1);

  return (
    <div
      className="relative inline-flex h-[240px] w-full max-w-[640px] flex-col items-center justify-center text-[#F2F2F2]"
      onMouseEnter={retrigger}
      onMouseLeave={retrigger}
    >
      <div className="flex flex-col items-center justify-center text-center leading-none">
        <TextScramble
          key={`name-${run}`}
          text="anthony dake"
          className="text-[58px] font-small tracking-[-0.02em] text-[#F2F2F2]"
          duration={500}
          charset="#%&$@+|"
          scrambleFraction={0.35}
          trigger={run}
        />
        <div className="mt-4 text-[14px] uppercase tracking-[0.32em] text-[#A1A1A6]">
          <TextScramble
            key={`desc-${run}`}
            text="ARCHITECT OF SOUND"
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
