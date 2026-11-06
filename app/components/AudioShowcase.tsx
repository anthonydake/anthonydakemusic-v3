"use client";

import { useEffect, useRef, useState } from "react";

export interface AudioClip {
  id: string;
  title: string;
  artist?: string;
  duration: string;
  src: string;
}

export const AUDIO_CLIPS: AudioClip[] = [
  { id: "back-and-forth",     title: "Back & Forth",       artist: "Madelyn Leona",   duration: "0:27", src: "https://s4sgra2uircghynp.public.blob.vercel-storage.com/audio/back-and-forth.mp3" },
  { id: "cycles",             title: "Cycles",             artist: "BittyOTW",        duration: "0:26", src: "https://s4sgra2uircghynp.public.blob.vercel-storage.com/audio/cycles.mp3" },
  { id: "mr-nice-guy",        title: "Mr Nice Guy",        artist: "unreleased demo", duration: "0:25", src: "https://s4sgra2uircghynp.public.blob.vercel-storage.com/audio/mr-nice-guy.mp3" },
  { id: "the-thought-of-you", title: "The Thought of You",                            duration: "0:17", src: "https://s4sgra2uircghynp.public.blob.vercel-storage.com/audio/the-thought-of-you.mp3" },
  { id: "untitled-beat",      title: "Untitled beat",                                 duration: "0:30", src: "https://s4sgra2uircghynp.public.blob.vercel-storage.com/audio/untitled-beat.mp3" },
];

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
    <ul className="mx-auto w-full max-w-[560px] text-left">
      {AUDIO_CLIPS.map((clip) => {
        const playing = activeId === clip.id;
        const pct = (progress[clip.id] ?? 0) * 100;
        return (
          <li key={clip.id} className="border-t border-white/[0.08] last:border-b">
            <button
              type="button"
              onClick={() => handleToggle(clip)}
              aria-pressed={playing}
              aria-label={`${playing ? "Pause" : "Play"} ${clip.title}${clip.artist ? ` by ${clip.artist}` : ""}`}
              className="group flex w-full items-center gap-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.16] text-[#F2F2F2] transition-colors group-hover:border-white/[0.4] group-focus-visible:border-white/[0.4]"
              >
                {playing ? <PauseIcon /> : <PlayIcon />}
              </span>
              <span className="min-w-0 flex-1 text-[15px] leading-[1.4] text-[#F2F2F2]">
                {clip.title}
                {clip.artist ? <span className="text-[#9A9A9A]"> · {clip.artist}</span> : null}
              </span>
              <span className="shrink-0 text-[12px] tabular-nums text-[#5C5C5C]">{clip.duration}</span>
            </button>
            <div className="h-px w-full bg-transparent" aria-hidden="true">
              <div
                className="h-px bg-[#F2F2F2] transition-[width] duration-150 ease-linear motion-reduce:transition-none"
                style={{ width: playing ? `${pct}%` : "0%" }}
              />
            </div>
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
          </li>
        );
      })}
    </ul>
  );
}
