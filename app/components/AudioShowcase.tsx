"use client";

import { useEffect, useRef, useState } from "react";

export interface AudioClip {
  id: string;
  label: string;
  src: string;
}

// Set real public URLs to activate (20–30s mp3 clips, ~128kbps).
// Upload with: npm run upload-media -- <local-file> audio/<name>.mp3
export const AUDIO_CLIPS: AudioClip[] = [
  // { id: "gospel", label: "Gospel", src: "https://…/audio/gospel.mp3" },
  // { id: "rnb",    label: "Pop / R&B", src: "https://…/audio/rnb.mp3" },
  // { id: "rock",   label: "Rock", src: "https://…/audio/rock.mp3" },
  // { id: "pocket", label: "Pocket", src: "https://…/audio/pocket.mp3" },
];

const RING_RADIUS = 20;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function AudioShowcase() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach((el) => {
        if (el) {
          el.pause();
          el.currentTime = 0;
        }
      });
    };
  }, []);

  if (AUDIO_CLIPS.length === 0) return null;

  const stopAllExcept = (id: string | null) => {
    Object.entries(audioRefs.current).forEach(([key, el]) => {
      if (!el) return;
      if (key === id) return;
      el.pause();
      el.currentTime = 0;
    });
  };

  const handleToggle = (clip: AudioClip) => {
    const el = audioRefs.current[clip.id];
    if (!el) return;
    if (activeId === clip.id) {
      el.pause();
      el.currentTime = 0;
      setActiveId(null);
      setProgress((p) => ({ ...p, [clip.id]: 0 }));
      return;
    }
    stopAllExcept(clip.id);
    setProgress((p) => ({ ...p, [clip.id]: 0 }));
    el.currentTime = 0;
    const playPromise = el.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.catch(() => {});
    }
    setActiveId(clip.id);
  };

  return (
    <div className="my-6 flex w-full flex-wrap items-start justify-center gap-5 sm:gap-6">
      {AUDIO_CLIPS.map((clip) => {
        const isActive = activeId === clip.id;
        const pct = progress[clip.id] ?? 0;
        const dashOffset = RING_CIRCUMFERENCE * (1 - pct);
        const gradientId = `audio-gradient-${clip.id}`;
        return (
          <div key={clip.id} className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => handleToggle(clip)}
              aria-label={`${isActive ? "Pause" : "Play"} ${clip.label} clip`}
              aria-pressed={isActive}
              className="group relative inline-flex h-[52px] w-[52px] items-center justify-center rounded-full border border-white/10 bg-black/70 shadow-sm transition hover:-translate-y-0.5 hover:border-white/30 hover:shadow-md sm:h-[56px] sm:w-[56px]"
            >
              <svg viewBox="0 0 48 48" className="h-full w-full" aria-hidden="true">
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="60%" stopColor="#8EC5FF" />
                    <stop offset="100%" stopColor="#FFFFFF" />
                  </linearGradient>
                </defs>
                {isActive && (
                  <circle
                    cx="24"
                    cy="24"
                    r={RING_RADIUS}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 24 24)"
                    style={{ transition: "stroke-dashoffset 120ms linear" }}
                  />
                )}
                {isActive ? (
                  <g>
                    <rect
                      x="18"
                      y="16"
                      width="3.5"
                      height="16"
                      rx="0.75"
                      fill="none"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="26.5"
                      y="16"
                      width="3.5"
                      height="16"
                      rx="0.75"
                      fill="none"
                      stroke={`url(#${gradientId})`}
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </g>
                ) : (
                  <path
                    d="M19 15.5 L33 24 L19 32.5 Z"
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
              <audio
                ref={(el) => {
                  audioRefs.current[clip.id] = el;
                }}
                src={clip.src}
                preload="none"
                onTimeUpdate={(e) => {
                  const el = e.currentTarget;
                  if (!el.duration || Number.isNaN(el.duration)) return;
                  setProgress((p) => ({ ...p, [clip.id]: el.currentTime / el.duration }));
                }}
                onEnded={() => {
                  setActiveId((a) => (a === clip.id ? null : a));
                  setProgress((p) => ({ ...p, [clip.id]: 0 }));
                }}
              />
            </button>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 sm:text-[11px]">
              <span>{clip.label}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
