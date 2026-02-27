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
