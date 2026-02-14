import type { ProjectIndexItem } from "./projects.data";

export type { ProjectIndexItem, ProjectPreview } from "./projects.data";

export const performanceIndex: ProjectIndexItem[] = [
  {
    id: "P01",
    date: "02/25/2022",
    year: 2022,
    artist: "KJ The Cool Nerd, AR!YAH",
    workTags: ["PRODUCTION/SONGWRITING"],
    title: "CLASS LOSER",
    slug: "template",
    preview: { type: "image", src: "/projects/template/Missin U.jpg" },
  },
  {
    id: "P02",
    date: "02/25/2022",
    year: 2022,
    artist: "KJ The Cool Nerd, AR!YAH",
    workTags: ["PRODUCTION/SONGWRITING"],
    title: "CLASS LOSER",
    slug: "template-2",
    preview: { type: "image", src: "/projects/template/Missin U.jpg" },
  },
];
