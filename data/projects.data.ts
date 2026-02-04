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
    id: "A01",
    date: "09/21/2024",
    year: 2024,
    artist: "Glasshouse Sessions",
    workTags: ["PRODUCTION/SONGWRITING", "DRUMS"],
    title: "LIVE PERFORMANCE FILM",
    slug: "glasshouse-sessions",
    preview: { type: "image", src: "/hero.jpg" },
    featured: true,
  },
  {
    id: "A02",
    date: "03/10/2023",
    year: 2023,
    artist: "Late Arrival",
    workTags: ["PRODUCTION/SONGWRITING", "DRUMS"],
    title: "STUDIO SINGLE",
    slug: "late-arrival",
    preview: { type: "image", src: "/projects/late-arrival.svg" },
  },
  {
    id: "A03",
    date: "02/26/2022",
    year: 2022,
    artist: "Neon Skyline",
    workTags: ["MUSICAL DIRECTION", "DRUMS"],
    title: "FESTIVAL RUN / TOUR",
    slug: "neon-skyline-tour",
    preview: { type: "image", src: "/projects/neon-skyline.svg" },
  },
];

