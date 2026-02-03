export type ProjectMedia =
  | { kind: "video"; provider: "youtube" | "vimeo"; id: string; title?: string }
  | { kind: "audio"; provider: "spotify" | "apple_music" | "soundcloud"; url: string; title?: string; height?: number }
  | { kind: "image"; src: string; alt: string; title?: string };

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  year: number;
  role: string;
  tags: string[];
  blurb: string;
  tone: [string, string]; // gradient stops for hover/tiles
  deliverables: string[];
  credits: string[];
  narrative: string[];
  links: { label: string; href: string }[];
  media: ProjectMedia[];
};

export { projects } from "./projects.generated";
