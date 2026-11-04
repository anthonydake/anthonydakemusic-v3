"use client";

import { useEffect, useMemo, useState } from "react";
import {
  practiceEntries,
  type PracticeEntry,
  type VideoClip,
} from "@/data/practice.data";
import SiteHeader from "@/app/components/SiteHeader";
import FooterLine from "@/app/components/FooterLine";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatLastSessionDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function groupByDate(entries: PracticeEntry[]): Map<string, PracticeEntry[]> {
  const groups = new Map<string, PracticeEntry[]>();
  for (const entry of entries) {
    const existing = groups.get(entry.date);
    if (existing) {
      existing.push(entry);
    } else {
      groups.set(entry.date, [entry]);
    }
  }
  return groups;
}

export default function PracticePageClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState<{ entryId: string; clip: VideoClip } | null>(null);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return practiceEntries;
    const q = searchQuery.toLowerCase();
    return practiceEntries.filter(
      (e) => e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const dateGroups = useMemo(() => groupByDate(filteredEntries), [filteredEntries]);

  useEffect(() => {
    if (!activeVideo) return;
    const { style } = document.body;
    const prev = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = prev;
    };
  }, [activeVideo]);

  return (
    <div className="bg-black text-[#F2F2F2]">
      <SiteHeader />
      <main
        id="main-content"
        className="page-fade-in mx-auto max-w-[640px] px-6 pt-24 pb-16 sm:px-8"
      >
        <header className="mb-10">
          <h1 className="grad font-serif-display text-[40px] leading-tight tracking-[-0.02em] sm:text-[52px]">
            Practice
          </h1>
          <p className="mt-2 text-[15px] text-[#9A9A9A]">
            {practiceEntries[0]
              ? `Practice journal · Last session ${formatLastSessionDate(practiceEntries[0].date)}`
              : "Practice journal"}
          </p>
        </header>

        <div className="relative mb-10">
          <input
            type="text"
            aria-label="Search practice sessions"
            placeholder="Search sessions…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-[18px] text-[#5C5C5C] hover:text-[#F2F2F2] transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {filteredEntries.length === 0 ? (
          <p className="py-16 text-center text-[15px] text-[#5C5C5C]">No sessions found</p>
        ) : (
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-0 bottom-0 w-px bg-white/[0.08]" />

            {Array.from(dateGroups.entries()).map(([date, entries]) => (
              <div key={date} className="mb-10">
                <div className="relative mb-4 flex items-center">
                  <div className="absolute -left-6 h-[15px] w-[15px] rounded-full border border-white/20 bg-black" />
                  <time dateTime={date} className="text-[12px] text-[#5C5C5C]">
                    {formatDate(date)}
                  </time>
                </div>

                <div className="space-y-6">
                  {entries.map((entry) => (
                    <article key={entry.id}>
                      <p className="text-[12px] text-[#5C5C5C]">
                        Session #{entry.sessionNumber} · {entry.duration} min
                      </p>
                      <h3 className="mt-1 text-[15px] text-[#F2F2F2]">{entry.title}</h3>
                      <p className="mt-2 text-[15px] leading-[1.6] text-[#9A9A9A]">
                        {entry.description}
                      </p>
                      {entry.videos && entry.videos.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#9A9A9A]">
                          {entry.videos.map((clip, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveVideo({ entryId: entry.id, clip })}
                              className="hover:text-[#F2F2F2] transition-colors"
                            >
                              {clip.label} →
                            </button>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            ))}

            <div className="relative flex items-center">
              <div className="absolute -left-6 h-[15px] w-[15px] rounded-full border border-white/10 bg-black" />
              <span className="text-[12px] text-[#5C5C5C]">The beginning</span>
            </div>
          </div>
        )}
      </main>
      <FooterLine />

      {activeVideo && (
        <div
          className="fixed inset-0 z-[10000] flex flex-col bg-black/95"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          onClick={() => setActiveVideo(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setActiveVideo(null);
          }}
          tabIndex={0}
          role="dialog"
          aria-label={`Video: ${activeVideo.clip.label}`}
        >
          <div className="flex flex-shrink-0 items-center justify-between px-4 py-3">
            <span className="text-[12px] text-[#9A9A9A]">{activeVideo.clip.label}</span>
            <button
              onClick={() => setActiveVideo(null)}
              className="-mr-3 flex h-11 items-center gap-1.5 px-3 text-[12px] text-[#9A9A9A] hover:text-[#F2F2F2] transition-colors"
            >
              Close <span className="text-[18px]">&times;</span>
            </button>
          </div>
          <div
            className="flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              key={activeVideo.clip.url}
              controls
              playsInline
              className="max-h-full w-full rounded-lg"
              style={{ maxWidth: "56rem" }}
            >
              <source src={activeVideo.clip.url} type="video/mp4" />
              <source src={activeVideo.clip.url} type="video/quicktime" />
              <span className="text-[#9A9A9A]">Your browser does not support video playback.</span>
            </video>
          </div>
        </div>
      )}
    </div>
  );
}
