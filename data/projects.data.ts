export type DrumRole = "Drums" | "Drum Programming";

export type ProjectIndexItem = {
  id: string;
  year: number;
  artist: string;
  title: string;
  role: DrumRole;
};

// Sorted newest-first
export const projectIndex: ProjectIndexItem[] = [
  { id: "P12", year: 2025, artist: "AR!YAH", title: "Aura", role: "Drum Programming" },
  { id: "P18", year: 2025, artist: "BittyOTW", title: "Morning Coffee", role: "Drum Programming" },
  { id: "P11", year: 2025, artist: "Jae Esquire", title: "Get Down", role: "Drum Programming" },
  { id: "P10", year: 2024, artist: "Bitty", title: "Bring Me More", role: "Drum Programming" },
  { id: "P09", year: 2024, artist: "Madelyn Leona", title: "Back & Forth", role: "Drums" },
  { id: "P08", year: 2024, artist: "KJ The Cool Nerd", title: "Wake Up", role: "Drums" },
  { id: "P07", year: 2024, artist: "KJ The Cool Nerd", title: "Cruisin", role: "Drum Programming" },
  { id: "P06", year: 2024, artist: "KJ The Cool Nerd & WANYEH", title: "Dark Knight", role: "Drum Programming" },
  { id: "P05", year: 2024, artist: "Bitty & WANYEH", title: "Bitts and Pieces", role: "Drum Programming" },
  { id: "P04", year: 2023, artist: "Bitty & WANYEH", title: "Lazy Days", role: "Drum Programming" },
  { id: "P03", year: 2023, artist: "Bitty & WANYEH", title: "Small Business", role: "Drum Programming" },
  { id: "P17", year: 2023, artist: "Riyah", title: "Infinities (Project 88)", role: "Drum Programming" },
  { id: "P02", year: 2023, artist: "Bitty", title: "Repercussions", role: "Drum Programming" },
  { id: "P16", year: 2023, artist: "WANYEH", title: "RoadTrixtape", role: "Drum Programming" },
  { id: "P15", year: 2022, artist: "Riyah", title: "Sundown", role: "Drums" },
  { id: "P14", year: 2022, artist: "WANYEH", title: "FLORA 2", role: "Drum Programming" },
  { id: "P01", year: 2022, artist: "KJ The Cool Nerd feat. Riyah", title: "Missin U (feat. Riyah)", role: "Drum Programming" },
  { id: "P13", year: 2022, artist: "KJ The Cool Nerd", title: "Class Loser", role: "Drums" },
];
