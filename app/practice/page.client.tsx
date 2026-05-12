"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  practiceEntries,
  totalSessions,
  firstSessionDate,
  type PracticeEntry,
  type ContentType,
} from "@/data/practice.data";
import SiteHeader from "@/app/components/SiteHeader";

const contentBadgeStyles: Record<ContentType, string> = {
  video: "bg-red-500/15 text-red-400 border-red-500/20",
  pdf: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  photos: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

const contentLabels: Record<ContentType, string> = {
  video: "Video",
  pdf: "PDF",
  photos: "Photos",
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatSinceDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
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
  const [revealCount, setRevealCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return practiceEntries;
    const q = searchQuery.toLowerCase();
    return practiceEntries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const dateGroups = useMemo(() => groupByDate(filteredEntries), [filteredEntries]);

  // Staggered reveal animation
  useEffect(() => {
    const total = filteredEntries.length;
    if (total === 0) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setRevealCount(total);
      return;
    }
    let count = 0;
    setRevealCount(0);
    const t = window.setTimeout(() => {
      count = 1;
      setRevealCount(1);
      const interval = window.setInterval(() => {
        count += 1;
        setRevealCount(count);
        if (count >= total) window.clearInterval(interval);
      }, 100);
      return () => window.clearInterval(interval);
    }, 100);
    return () => window.clearTimeout(t);
  }, [filteredEntries.length]);

  // Lock body scroll
  useEffect(() => {
    const { style } = document.body;
    const prev = style.overflow;
    style.overflow = "hidden";
    return () => {
      style.overflow = prev;
    };
  }, []);

  let flatIndex = 0;

  return (
    <div className="relative bg-black text-white h-screen overflow-hidden">
      <SiteHeader />
      <main
        id="main-content"
        className="relative z-[10] mx-auto max-w-3xl px-6 pb-24 pt-[120px] sm:pt-[160px] sm:px-8 h-[calc(100svh-56px)] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="mb-8 flex-shrink-0">
          <h1 className="text-[28px] sm:text-[36px] font-light tracking-[0.3em] uppercase mb-2">
            <span>Practice</span>
          </h1>
          <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.28em] text-white/40 mb-6">
            <span>
              Session #{totalSessions} · Daily log since{" "}
              {formatSinceDate(firstSessionDate)}
            </span>
          </p>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-[12px] tracking-wider text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-[14px]"
              >
                <span>×</span>
              </button>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div
          ref={scrollRef}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-2"
          style={{ scrollbarWidth: "none" }}
        >
          {filteredEntries.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/30 text-[12px] uppercase tracking-widest">
                <span>No sessions found</span>
              </p>
            </div>
          ) : (
            <div className="relative pl-6">
              {/* Timeline rail */}
              <div className="absolute left-[7px] top-0 bottom-0 w-px bg-white/10" />

              {Array.from(dateGroups.entries()).map(([date, entries]) => {
                const dateEntries = entries.filter((_, i) => {
                  const idx = filteredEntries.indexOf(entries[i]);
                  return idx < revealCount;
                });
                if (dateEntries.length === 0) return null;

                return (
                  <div key={date} className="mb-8">
                    {/* Date header */}
                    <div className="relative flex items-center mb-4">
                      <div className="absolute -left-6 w-[15px] h-[15px] rounded-full border-2 border-blue-400/60 bg-black flex items-center justify-center">
                        <div className="w-[5px] h-[5px] rounded-full bg-blue-400" />
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.28em] text-white/50">
                        {formatDate(date)}
                      </span>
                    </div>

                    {/* Entries for this date */}
                    <div className="space-y-3">
                      {dateEntries.map((entry) => {
                        flatIndex++;
                        return (
                          <div
                            key={entry.id}
                            className="relative group border border-white/[0.06] rounded-lg p-4 hover:border-white/15 transition-colors bg-white/[0.02]"
                          >
                            {/* Session number + duration */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                                Session #{entry.sessionNumber}
                              </span>
                              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                                {entry.duration} min
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-[13px] sm:text-[14px] font-medium tracking-wide mb-2 leading-snug">
                              <span>{entry.title}</span>
                            </h3>

                            {/* Description */}
                            <p className="text-[11.5px] sm:text-[12px] leading-relaxed text-white/50 mb-3">
                              <span>{entry.description}</span>
                            </p>

                            {/* Content type badges */}
                            {entry.contentTypes.length > 0 && (
                              <div className="flex items-center gap-2">
                                {entry.contentTypes.map((type) => (
                                  <span
                                    key={type}
                                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${contentBadgeStyles[type]}`}
                                  >
                                    {contentLabels[type]}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Timeline end dot */}
              <div className="relative flex items-center">
                <div className="absolute -left-6 w-[15px] h-[15px] rounded-full border-2 border-white/20 bg-black" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/20">
                  The beginning
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        .practice-scroll { scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; }
        .practice-scroll::-webkit-scrollbar { width: 0; height: 0; }
      `}</style>
    </div>
  );
}
