"use client";

import { useEffect, useRef, useState } from "react";

export default function TextScramble({
  text,
  className = "",
  style,
  duration = 700,
  charset = "abcdefghijklmnopqrstuvwxyz",
  scrambleFraction = 0.35,
  trigger = 0,
  leftToRight = false,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  duration?: number;
  charset?: string;
  scrambleFraction?: number; // 0–1
  trigger?: number; // bump to retrigger
  leftToRight?: boolean;
}) {
  const [display, setDisplay] = useState(text);
  const displayRef = useRef(text);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const length = text.length;
    const frac = Math.min(Math.max(scrambleFraction, 0), 1);

    const minCount = Math.max(1, Math.floor(length * Math.max(0.3, frac - 0.05)));
    const maxCount = Math.max(minCount, Math.ceil(length * Math.min(0.4, frac + 0.05)));
    const count = Math.min(length, Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount);

    const indices = Array.from({ length }, (_, i) => i).filter((i) => text[i] !== " ");
    if (!leftToRight) {
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
    }
    const scrambleSet = new Set(leftToRight ? indices.slice(0, count).sort((a, b) => a - b) : indices.slice(0, count));
    const order = [...scrambleSet];

    function randomChar() {
      return charset[Math.floor(Math.random() * charset.length)];
    }

    function update(now: number) {
      const progress = Math.min((now - start) / duration, 1);

      const scrambled = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (!scrambleSet.has(i)) return char;
          const idx = order.indexOf(i);
          const threshold = (idx + 1) / order.length;
          if (progress >= threshold) return char;
          // Slow down the swaps further: keep previous most frames, occasionally change
          if (Math.random() < 0.08) return randomChar();
          return displayRef.current[i] || char;
        })
        .join("");

      setDisplay(scrambled);
      displayRef.current = scrambled;

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(update);
      }
    }

    rafRef.current = requestAnimationFrame(update);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // leftToRight intentionally excluded to avoid effect length churn across renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, duration, charset, scrambleFraction, trigger]);

  return (
    <span className={className} style={style}>
      {display}
    </span>
  );
}
