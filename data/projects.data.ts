export type DrumRole = "Drums" | "Drum Programming";

export type ProjectIndexItem = {
  id: string;
  year: number;
  artist: string;
  title: string;
  role: DrumRole;
  youtubeUrl?: string;
};

// Sorted newest-first
export const projectIndex: ProjectIndexItem[] = [
  { id: "P12", year: 2025, artist: "AR!YAH", title: "Aura", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=rygn058o5OM" },
  { id: "P18", year: 2025, artist: "BittyOTW", title: "Morning Coffee", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=GKyBxEcYJIA" },
  { id: "P11", year: 2025, artist: "Jae Esquire", title: "Get Down", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=PdBcj7DCSJA" },
  { id: "P19", year: 2025, artist: "KJ The Cool Nerd", title: "Pray For Me", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=_oLkgRSg-ss" },
  { id: "P10", year: 2024, artist: "Bitty", title: "Bring Me More", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=uxkUGPQdYZw" },
  { id: "P09", year: 2024, artist: "Madelyn Leona", title: "Back & Forth", role: "Drums", youtubeUrl: "https://www.youtube.com/watch?v=6qLMNYQLHkw" },
  { id: "P08", year: 2024, artist: "KJ The Cool Nerd", title: "Wake Up", role: "Drums", youtubeUrl: "https://www.youtube.com/watch?v=sjE0nwUISZg" },
  { id: "P07", year: 2024, artist: "KJ The Cool Nerd", title: "Cruisin", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=8Bd6yGuyaRQ" },
  { id: "P06", year: 2024, artist: "KJ The Cool Nerd & WANYEH", title: "Dark Knight", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=_QfPY7PeSbQ" },
  { id: "P05", year: 2024, artist: "Bitty & WANYEH", title: "Bitts and Pieces", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=c_5nM0kKoig" },
  { id: "P04", year: 2023, artist: "Bitty & WANYEH", title: "Lazy Days", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=9IDW7HOz1sc" },
  { id: "P03", year: 2023, artist: "Bitty & WANYEH", title: "Small Business", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=SQU4NuenSCo" },
  { id: "P17", year: 2023, artist: "Riyah", title: "Infinities (Project 88)", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=mViUiY00PoA" },
  { id: "P02", year: 2023, artist: "Bitty", title: "Repercussions", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=MUdrD0wVsJ8" },
  { id: "P01", year: 2022, artist: "KJ The Cool Nerd feat. Riyah", title: "Missin U (feat. Riyah)", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=Sqxoyx_LDYw" },
  { id: "P13", year: 2022, artist: "KJ The Cool Nerd", title: "Class Loser", role: "Drums" },
  { id: "P20", year: 2022, artist: "KJ The Cool Nerd", title: "Heartbreaker", role: "Drums", youtubeUrl: "https://www.youtube.com/watch?v=ZUJLR6GrItA" },
  { id: "P21", year: 2022, artist: "KJ The Cool Nerd", title: "Falisity", role: "Drum Programming", youtubeUrl: "https://www.youtube.com/watch?v=4LkvPiSfcv8" },
];
