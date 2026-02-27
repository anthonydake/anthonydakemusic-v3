export const WORK_TAGS = [
  "PRODUCTION/SONGWRITING",
  "MIXING/MASTERING",
  "DRUMS",
  "MUSICAL DIRECTION",
] as const;

export type WorkTag = (typeof WORK_TAGS)[number];

export type ProjectPreview =
  | { type: "image" | "gif"; src: string }
  | { type: "video"; src: string; poster?: string };

export type ProjectIndexItem = {
  id: string;
  date: string; // "MM/DD/YYYY"
  year: number;
  artist: string;
  workTags: WorkTag[];
  title: string;
  slug: string;
  preview?: ProjectPreview;
  featured?: boolean;
};

// Placeholder data (swap for real projects any time; UI is wired to this file only).
export const projectIndex: ProjectIndexItem[] = [
  {
    id: "P09",
    date: "05/24/2024",
    year: 2024,
    artist: "Madelyn Leona",
    workTags: ["PRODUCTION/SONGWRITING", "DRUMS", "MIXING/MASTERING"],
    title: "Back & Forth",
    slug: "back-and-forth",
    preview: { type: "image", src: "/placements/back-and-forth.jpg" },
  },
  {
    id: "P08",
    date: "03/27/2024",
    year: 2024,
    artist: "KJ The Cool Nerd",
    workTags: ["DRUMS", "MIXING/MASTERING"],
    title: "Wake Up",
    slug: "wake-up",
    preview: { type: "image", src: "/placements/wake-up.jpg" },
  },
  {
    id: "P07",
    date: "09/27/2024",
    year: 2024,
    artist: "KJ The Cool Nerd",
    workTags: ["PRODUCTION/SONGWRITING", "MIXING/MASTERING"],
    title: "Cruisin",
    slug: "cruisin",
    preview: { type: "image", src: "/placements/cruisin.jpg" },
  },
  {
    id: "P06",
    date: "09/27/2024",
    year: 2024,
    artist: "KJ The Cool Nerd & WANYEH",
    workTags: ["PRODUCTION/SONGWRITING", "MIXING/MASTERING"],
    title: "Dark Knight",
    slug: "dark-knight",
    preview: { type: "image", src: "/placements/dark-knight.jpg" },
  },
  {
    id: "P05",
    date: "05/19/2024",
    year: 2024,
    artist: "Bitty & WANYEH",
    workTags: ["PRODUCTION/SONGWRITING", "MIXING/MASTERING"],
    title: "Bitts and Pieces",
    slug: "bitts-and-pieces",
    preview: { type: "image", src: "/placements/bitts-and-pieces.jpg" },
  },
  {
    id: "P04",
    date: "12/15/2023",
    year: 2023,
    artist: "Bitty & WANYEH",
    workTags: ["MIXING/MASTERING"],
    title: "Lazy Days",
    slug: "lazy-days",
    preview: { type: "image", src: "/placements/small-business.jpg" },
  },
  {
    id: "P03",
    date: "12/15/2023",
    year: 2023,
    artist: "Bitty & WANYEH",
    workTags: ["PRODUCTION/SONGWRITING", "MIXING/MASTERING"],
    title: "Small Business",
    slug: "small-business",
    preview: { type: "image", src: "/placements/small-business.jpg" },
  },
  {
    id: "P02",
    date: "09/22/2023",
    year: 2023,
    artist: "Bitty",
    workTags: ["PRODUCTION/SONGWRITING", "MIXING/MASTERING"],
    title: "Repercussions",
    slug: "repercussions",
    preview: { type: "image", src: "/placements/repercussions.jpg" },
  },
  {
    id: "P01",
    date: "02/24/2022",
    year: 2022,
    artist: "KJ The Cool Nerd feat. Riyah",
    workTags: ["PRODUCTION/SONGWRITING", "MIXING/MASTERING"],
    title: "Missin U (feat. Riyah)",
    slug: "missin-u",
    preview: { type: "image", src: "/placements/missin-u.jpg" },
  },
];
