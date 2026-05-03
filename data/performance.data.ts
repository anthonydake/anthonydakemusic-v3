export type PerformanceItem = {
  id: string;
  year: number;
  primaryArtist: string;
  venue: string;
  city: string;
  state: string;
  youtubeUrl?: string;
};

// Sorted newest-first
export const performanceIndex: PerformanceItem[] = [
  {
    id: "L09",
    year: 2026,
    primaryArtist: "KJ The Cool Nerd",
    venue: "Urban Audio Collective “The Garden”",
    city: "Columbus",
    state: "OH",
    youtubeUrl: "https://www.youtube.com/watch?v=J9zmUzan9xg&t=1110s",
  },
  {
    id: "L08",
    year: 2026,
    primaryArtist: "KJ The Cool Nerd",
    venue: "Fuel Lounge OTR",
    city: "Cincinnati",
    state: "OH",
    youtubeUrl: "https://www.youtube.com/watch?v=Om7g2U6bd8Q&t=744",
  },
  {
    id: "L07",
    year: 2026,
    primaryArtist: "Valerie Lighthart",
    venue: "The Spacebar",
    city: "Columbus",
    state: "OH",
    youtubeUrl: "https://youtu.be/B2GC9OtUeaU?t=187",
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
    id: "L10",
    year: 2024,
    primaryArtist: "EDwen ft. KeezyTheeUnkind",
    venue: "Main Stage — Columbus Pride Festival",
    city: "Columbus",
    state: "OH",
    youtubeUrl: "https://www.youtube.com/watch?v=B5d8xn_r3CA&t=27",
  },
  {
    id: "L05",
    year: 2023,
    primaryArtist: "Columbus Children’s Choir",
    venue: "Broad Street Congregational Church",
    city: "Columbus",
    state: "OH",
    youtubeUrl: "https://youtu.be/4iqsBxyk5Kc",
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
  {
    id: "L03",
    year: 2022,
    primaryArtist: "Anthony Dake",
    venue: "Mees Hall",
    city: "Columbus",
    state: "OH",
  },
  {
    id: "L02",
    year: 2022,
    primaryArtist: "KJ The Cool Nerd",
    venue: "Yochum Hall",
    city: "Columbus",
    state: "OH",
    youtubeUrl: "https://www.youtube.com/watch?v=3LGtry8famg&t=135s",
  },
  {
    id: "L01",
    year: 2022,
    primaryArtist: "Bobby Floyd Trio",
    venue: "Natalie’s Grandview",
    city: "Columbus",
    state: "OH",
    youtubeUrl: "https://www.youtube.com/watch?v=5H5tw_vdkg4&t=272s",
  },
];
