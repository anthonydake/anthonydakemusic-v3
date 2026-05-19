export type PerformanceItem = {
  id: string;
  year: number;
  primaryArtist: string;
  venue: string;
  city: string;
  state: string;
  youtubeUrl?: string;
  tags?: string[];
};

// Sorted newest-first
export const performanceIndex: PerformanceItem[] = [
  {
    id: "L08",
    year: 2026,
    primaryArtist: "KJ The Cool Nerd",
    venue: "Fuel Lounge OTR",
    city: "Cincinnati",
    state: "OH",
    youtubeUrl: "https://www.youtube.com/watch?v=Om7g2U6bd8Q&t=810",
  },
  {
    id: "L06",
    year: 2025,
    primaryArtist: "KJ The Cool Nerd & WANYEH",
    venue: "John Bishop Park",
    city: "Whitehall",
    state: "OH",
    youtubeUrl: "https://www.youtube.com/watch?v=lhji4B7krzU&t=1321s",
  },
  {
    id: "L11",
    year: 2025,
    primaryArtist: "KJ The Cool Nerd",
    venue: "Mainstage — ComFest Columbus",
    city: "Columbus",
    state: "OH",
    youtubeUrl: "https://www.youtube.com/watch?v=lZbRkRiV21k&t=334",
  },
  {
    id: "L13",
    year: 2024,
    primaryArtist: "Smoothboi.Ty",
    venue: "Bozo Stage — ComFest Columbus",
    city: "Columbus",
    state: "OH",
    youtubeUrl: "https://www.youtube.com/watch?v=NLN0DC0CUJs&t=838",
  },
  {
    id: "L12",
    year: 2024,
    primaryArtist: "KeezyTheeUnkind",
    venue: "Bozo Stage — ComFest Columbus",
    city: "Columbus",
    state: "OH",
    youtubeUrl: "https://www.youtube.com/watch?v=NLN0DC0CUJs&t=2045",
  },
  {
    id: "L10",
    year: 2024,
    primaryArtist: "EDwen ft. KeezyTheeUnkind",
    venue: "Main Stage — Columbus Pride Festival",
    city: "Columbus",
    state: "OH",
    youtubeUrl: "https://www.youtube.com/watch?v=B5d8xn_r3CA&t=27",
  },
  {
    id: "L04",
    year: 2022,
    primaryArtist: "Short North Stage",
    venue: "The Garden Theatre",
    city: "Columbus",
    state: "OH",
    youtubeUrl: "https://www.youtube.com/watch?v=4jelx3r16m8",
  },
];
