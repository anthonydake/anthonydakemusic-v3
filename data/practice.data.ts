export type ContentType = "video" | "pdf" | "photos";

export type PracticeEntry = {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  sessionNumber: number;
  title: string;
  description: string;
  duration: number; // minutes
  contentTypes: ContentType[];
};

// Sorted newest-first
export const practiceEntries: PracticeEntry[] = [
  {
    id: "S005",
    date: "2026-05-12",
    sessionNumber: 5,
    title: "Single stroke speed building — 80 to 140bpm",
    description:
      "Started at 80bpm with full strokes, moved to 100 with wrist only, pushed to 140 finger control. Focused on evenness between hands — left hand gets lazy around 120. Recorded slow-mo video of stick heights at 130bpm to check consistency.",
    duration: 45,
    contentTypes: ["video"],
  },
  {
    id: "S004",
    date: "2026-05-11",
    sessionNumber: 4,
    title: "Ghost note dynamics in a funk groove",
    description:
      "Working on the gap between ghost notes and accents — trying to get the ghosts quieter without losing the pocket. Played along to Porcupine Tree 'Sound of Muzak' to test it in context. The backbeat needs to sit further back than I think.",
    duration: 60,
    contentTypes: ["video", "pdf"],
  },
  {
    id: "S003",
    date: "2026-05-10",
    sessionNumber: 3,
    title: "Displaced click training — click on beat 4 only",
    description:
      "Set the click to quarter notes on beat 4 only at 95bpm. Played simple rock grooves and tried to lock in. First 10 minutes were rough — kept rushing beat 1. By the end of the session the pocket felt solid. Need to try this at slower tempos next.",
    duration: 30,
    contentTypes: [],
  },
  {
    id: "S002",
    date: "2026-05-09",
    sessionNumber: 2,
    title: "Paradiddle accent patterns around the kit",
    description:
      "Took a standard paradiddle (RLRR LRLL) and moved the accent to each beat — accent on 1, then 2, then 3, then 4. Then orchestrated accents on toms, unaccented on snare. The accent-on-3 pattern feels like a great fill vocabulary builder.",
    duration: 50,
    contentTypes: ["video", "photos"],
  },
  {
    id: "S001",
    date: "2026-05-08",
    sessionNumber: 1,
    title: "Warm-up routine + brush patterns",
    description:
      "First session logged. Ran through my standard warm-up: singles, doubles, paradiddles at 60-100bpm. Then spent 25 minutes on jazz brush patterns — working on getting a smooth sweep circle with the left hand while the right hand plays independent time.",
    duration: 40,
    contentTypes: ["video"],
  },
];

// Computed values
export const totalSessions = practiceEntries.length;
export const firstSessionDate = practiceEntries.length > 0
  ? practiceEntries[practiceEntries.length - 1].date
  : new Date().toISOString().split("T")[0];
