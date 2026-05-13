export type ContentType = "video" | "pdf" | "photos";

export interface VideoClip {
  label: string;
  url: string;
}

export interface PracticeEntry {
  id: string;
  date: string;
  sessionNumber: number;
  title: string;
  description: string;
  duration: number;
  contentTypes: ContentType[];
  videos?: VideoClip[];
}

export const practiceEntries: PracticeEntry[] = [
  {
    id: "session-002",
    date: "2026-05-12",
    sessionNumber: 2,
    title: "Backbeat deep dive — no hi-hat, 50-80bpm",
    description: "Basic backbeat groove, kick and snare only (no hi-hat) from 50bpm up to 80bpm in 5bpm increments. Then no hi-hat backbeat at 84 and 88bpm with 16th note groove. Goal: discover a deeper pocket and better sense of timing at the micro level. Stripping away the hi-hat forces you to feel the space between kick and snare without a subdivision crutch.",
    duration: 50,
    contentTypes: ["video"],
    videos: [
      { label: "Backbeat 50bpm", url: "https://s4sgra2uircghynp.public.blob.vercel-storage.com/practice/2026-05-12/backbeat%2050-mS9TzP4QmrEm9GogrU6c6D9zIm5qJV.mov" },
      { label: "Backbeat 55bpm", url: "https://s4sgra2uircghynp.public.blob.vercel-storage.com/practice/2026-05-12/backbeat%2055-nxiyNDu2rwIoP2UtWW3QBZ32pzS6LI.mov" },
      { label: "Backbeat 60bpm", url: "https://s4sgra2uircghynp.public.blob.vercel-storage.com/practice/2026-05-12/backbeat%2060-u4VAQa6n5uqW3uFQo5FawQCn76vySM.mov" },
      { label: "Backbeat 65bpm", url: "https://s4sgra2uircghynp.public.blob.vercel-storage.com/practice/2026-05-12/backbeat%2065-MtiejPGqyOAbp0uHGEcNA1bDojrnVJ.mov" },
      { label: "Backbeat 70bpm", url: "https://s4sgra2uircghynp.public.blob.vercel-storage.com/practice/2026-05-12/backbeat%2070-ryC960xEKHB5hPLe4a291K0N68Ix5a.mov" },
      { label: "Backbeat 75bpm", url: "https://s4sgra2uircghynp.public.blob.vercel-storage.com/practice/2026-05-12/backbeat%2075-n3oq2onQViouCflGoPYx5Heg5TlHAp.mov" },
      { label: "Backbeat 80bpm", url: "https://s4sgra2uircghynp.public.blob.vercel-storage.com/practice/2026-05-12/backbeat%2080-MjBC5yeSL2NKw6N4shqfTGVnr9sZ6x.mov" },
      { label: "16th groove 84bpm", url: "https://s4sgra2uircghynp.public.blob.vercel-storage.com/practice/2026-05-12/16th%20groove%2084bpm-3imoa0hG4Gma1EIFwNGVwmQfUpZ0ov.mov" },
      { label: "16th groove 88bpm", url: "https://s4sgra2uircghynp.public.blob.vercel-storage.com/practice/2026-05-12/16th%20groove%2088bpm-HjYky45uVSj7tDCfIFX1ME5aiIUHic.mov" },
    ],
  },
  {
    id: "session-001",
    date: "2026-05-11",
    sessionNumber: 1,
    title: "Day one — single strokes, basic groove, gap click, transcription",
    description: "Started with 5 minutes of single strokes on pad, pianissimo to fortissimo and back with dynamic ramps in between. Basic rock groove at 72bpm (kick on 1 and 3, snare on 2 and 4, hi-hat on eighth notes) for 5 minutes nonstop, then repeated at 92bpm. Same exercises with gap click via TimeGuru app — standard click had minor drift both ahead and behind (72 was generally better than 92), gap click had major drift (usually fast on 72, slow at 92). Transcribed the Steve Jordan drum part to \"Waiting on the World to Change\" by John Mayer. Listened to Tracy Chapman\'s \"Fast Car\" and wrote out the arrangement without playing any drum parts — pure listening and arrangement mapping. Finished with single stroke roll 16th notes, max tempo 175bpm.",
    duration: 45,
    contentTypes: [],
  },
];

export const totalSessions = practiceEntries.length;
export const firstSessionDate = practiceEntries[practiceEntries.length - 1]?.date || "";
