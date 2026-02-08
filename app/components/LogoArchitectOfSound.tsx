"use client";

import { useState } from "react";
import TextScramble from "./TextScramble";

export default function LogoArchitectOfSound() {
  const [run, setRun] = useState(0);
  const retrigger = () => setRun((n) => n + 1);
  const titleStyle: React.CSSProperties = {
    textShadow: "0 0 18px rgba(244, 246, 249, 0.18), 0 6px 18px rgba(0, 0, 0, 0.45)",
  };
  const subtitleStyle: React.CSSProperties = {
    textShadow: "0 0 12px rgba(244, 246, 249, 0.12)",
  };

  return (
    <div
      className="relative inline-flex h-[240px] w-full max-w-[640px] flex-col items-center justify-center text-white"
      onMouseEnter={retrigger}
      onMouseLeave={retrigger}
    >
      <div className="flex flex-col items-center justify-center text-center leading-none">
        <TextScramble
          key={`name-${run}`}
          text="anthony dake"
          className="text-[58px] font-small tracking-[-0.02em] text-white"
          duration={500}
          charset="#%&$@+|"
          scrambleFraction={0.22}
          trigger={run}
          style={titleStyle}
        />
        <div className="mt-4 text-[14px] uppercase tracking-[0.32em] text-[#cdd3dc]" style={subtitleStyle}>
          <TextScramble
            key={`desc-${run}`}
            text="ARCHITECT OF SOUND"
            duration={500}
            charset="#%&$@+|"
            scrambleFraction={0.22}
            trigger={run}
          />
        </div>
      </div>
    </div>
  );
}
