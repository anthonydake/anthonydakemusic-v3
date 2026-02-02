export type Project = {
  slug: string
  title: string
  subtitle: string
  year: string
  role: string
  tags: string[]
  blurb: string
  embed?: { label: string; src: string } // iframe src
}

export const projects: Project[] = [
  {
    slug: "project-1",
    title: "Project Title One",
    subtitle: "Artist / Brand / Tour",
    year: "2025",
    role: "Producer • Drums • MD",
    tags: ["Production", "Session Drums", "Live"],
    blurb:
      "Short case-study summary. What you did, why it mattered, and the result.",
    embed: {
      label: "Listen",
      // Replace later with your actual embed src (YouTube/SoundCloud/Spotify iframe src)
      src: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    },
  },
  {
    slug: "project-2",
    title: "Project Title Two",
    subtitle: "Release / Performance",
    year: "2024",
    role: "Session Drums",
    tags: ["Drums", "Recording"],
    blurb:
      "Short case-study summary. Talk about tone, approach, and deliverables.",
  },
]
