export type DrumRole = "Drums" | "Drum Programming";

export type ProjectIndexItem = {
  id: string;
  year: number;
  artist: string;
  title: string;
  role: DrumRole;
  youtubeUrl?: string;
  tags?: string[];
};

// Curated top 8 — ranked by streams + social momentum across all years, newest-first
export const projectIndex: ProjectIndexItem[] = [
  { id: "P12", year: 2025, artist: "AR!YAH", title: "Aura", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=rygn058o5OM" },
  { id: "P19", year: 2025, artist: "KJ The Cool Nerd", title: "Pray For Me", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=_oLkgRSg-ss" },
  { id: "P10", year: 2024, artist: "Bitty", title: "Bring Me More", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=uxkUGPQdYZw" },
  { id: "P05", year: 2024, artist: "Bitty & WANYEH", title: "Bitts and Pieces", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=c_5nM0kKoig" },
  { id: "P06", year: 2024, artist: "KJ The Cool Nerd & WANYEH", title: "Dark Knight", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=_QfPY7PeSbQ" },
  { id: "P02", year: 2023, artist: "Bitty", title: "Repercussions", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=MUdrD0wVsJ8" },
  { id: "P04", year: 2023, artist: "Bitty & WANYEH", title: "Lazy Days", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=9IDW7HOz1sc" },
  { id: "P03", year: 2023, artist: "Bitty & WANYEH", title: "Small Business", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=SQU4NuenSCo" },
];
