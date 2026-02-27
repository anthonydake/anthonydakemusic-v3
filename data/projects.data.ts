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
    date: "01/15/2026",
    year: 2026,
    artist: "Placeholder Artist",
    workTags: ["PRODUCTION/SONGWRITING"],
    title: "Template Placement",
    slug: "template",
    preview: { type: "image", src: "/placements/template/placeholder.jpg" },
  },
];
