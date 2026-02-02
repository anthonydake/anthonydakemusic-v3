"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  className?: string;
  cycles?: 2 | 3;
  stepMs?: number; // time per “swap”
  staggerMs?: number; // per-character delay
  charset?: string;
};

export default function ScrambleText({
  text,
  className,
  cycles = 3,
  stepMs = 55,
  staggerMs = 10,
  charset = "!@#$%^&*()",
}: Props) {
  const [display, setDisplay] = useState(text);

  const rafRef = useRef<number | null>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    setDisplay(text);
  }, [text]);

  const pick = () => charset[Math.floor(Math.random() * charset.length)];

  const start = () => {
    runIdRef.current += 1;
    const runId = runIdRef.current;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const base = text;
    const len = base.length;

    // Pre-generate 2–3 random chars per letter for this run (fresh every hover in/out).
    const seq: string[][] = Array.from({ length: len }, (_, i) => {
      const ch = base[i];
      if (ch === " ") return [" "];

      const s: string[] = [];
      for (let k = 0; k < cycles; k++) s.push(pick());
      s.push(ch); // final
      return s;
    });

    const t0 = performance.now();
    const total =
      (len - 1) * staggerMs + cycles * stepMs + 80; // short settle

    const frame = (now: number) => {
      if (runId !== runIdRef.current) return;

      const t = now - t0;

      let out = "";
      for (let i = 0; i < len; i++) {
        const ch = base[i];

        if (ch === " ") {
          out += " ";
          continue;
        }

        const local = t - i * staggerMs;
        if (local <= 0) {
          out += base[i];
          continue;
        }

        const step = Math.min(cycles, Math.floor(local / stepMs));
        // step 0..cycles -> show random swaps, then settle to final
        out += step < cycles ? seq[i][step] : base[i];
      }

      setDisplay(out);

      if (t < total) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setDisplay(text);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(frame);
  };

  return (
    <span
      className={className}
      onMouseEnter={start}
      onMouseLeave={start}
      onFocus={start}
      onBlur={start}
    >
      {display}
    </span>
  );
}
