export type Production = {
  id: string;
  title: string;
  artist: string;
  year: number;
  youtubeId: string;
  cover: string;
  duration: string;
};

// Songs Anthony produced start to finish. Order = display order.
export const PRODUCTIONS: Production[] = [
  { id: "cycles",         title: "Cycles",        artist: "BittyOTW",                       year: 2025, youtubeId: "igaxmP2tTU8", cover: "/covers/cycles.jpg",         duration: "2:48" },
  { id: "aura",           title: "Aura",          artist: "AR!YAH",                         year: 2025, youtubeId: "rygn058o5OM", cover: "/covers/aura.jpg",           duration: "3:17" },
  { id: "pray-for-me",    title: "Pray For Me",   artist: "KJ The Cool Nerd",               year: 2025, youtubeId: "_oLkgRSg-ss", cover: "/covers/pray-for-me.jpg",    duration: "3:18" },
  { id: "back-and-forth", title: "Back & Forth",  artist: "Madelyn Leona",                  year: 2024, youtubeId: "6qLMNYQLHkw", cover: "/covers/back-and-forth.jpg", duration: "3:29" },
  { id: "repercussions",  title: "Repercussions", artist: "Bitty",                          year: 2023, youtubeId: "MUdrD0wVsJ8", cover: "/covers/repercussions.jpg",  duration: "3:43" },
  { id: "missin-u",       title: "Missin U",      artist: "KJ The Cool Nerd feat. Riyah",   year: 2022, youtubeId: "Sqxoyx_LDYw", cover: "/covers/missin-u.jpg",       duration: "4:00" },
];
