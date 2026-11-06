"use client";

import { useEffect, useRef, useState } from "react";
import { AUDIO_CLIPS } from "./AudioShowcase";

function PlayIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
      <path d="M0 0 L10 6 L0 12 Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
      <rect x="0.5" y="0" width="2.5" height="12" rx="0.5" />
      <rect x="7" y="0" width="2.5" height="12" rx="0.5" />
    </svg>
  );
}

export default function HeroListen() {
  const clip = AUDIO_CLIPS[0];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return () => {
      const el = audioRef.current;
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
    };
  }, []);

  if (!clip) return null;

  const handleToggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      el.currentTime = 0;
      setPlaying(false);
      setProgress(0);
      return;
    }
    el.currentTime = 0;
    const p = el.play();
    if (p && typeof p.then === "function") {
      p.catch(() => {});
    }
    setPlaying(true);
  };

  const label = playing ? "Playing · 0:27" : "Listen · 0:27";
  const pct = progress * 100;

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={playing}
      aria-label={playing ? "Pause Back & Forth" : "Play Back & Forth, 27 seconds"}
      className="group inline-flex flex-col items-start gap-1 rounded-sm text-[15px] text-[#F2F2F2] transition-colors hover:text-[#9A9A9A] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
    >
      <span className="inline-flex items-center gap-2">
        {playing ? <PauseIcon /> : <PlayIcon />}
        <span>{label}</span>
      </span>
      <span
        aria-hidden="true"
        className={`block h-px w-full ${playing ? "" : "opacity-0"}`}
      >
        <span
          className="block h-px bg-[#F2F2F2] transition-[width] duration-150 ease-linear motion-reduce:transition-none"
          style={{ width: playing ? `${pct}%` : "0%" }}
        />
      </span>
      <audio
        ref={audioRef}
        src={clip.src}
        preload="none"
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (!el.duration || Number.isNaN(el.duration)) return;
          setProgress(el.currentTime / el.duration);
        }}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
      />
    </button>
  );
}
