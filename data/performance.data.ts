export type PerformanceItem = {
  slug: string;
  title: string;
  primaryArtist: string;
  dateDisplay: string;
  venue?: string;
  city?: string;
  state?: string;
  roles: string[];
  subtitle?: string;
  artistUrl?: string;
  heroVideoUrl?: string;
  responsibilities?: string[];
  listenLinks?: { label: string; url: string }[];
  photoUrls?: string[];
};

export const performanceIndex: PerformanceItem[] = [
  {
    slug: "valerie-lighthart-spacebar-2026-01-29",
    title: "Live at The Spacebar",
    primaryArtist: "Valerie Lighthart",
    dateDisplay: "Jan 29 2026",
    venue: "The Spacebar",
    city: "Columbus",
    state: "OH",
    roles: ["Drums", "Playback"],
    artistUrl: "https://youtube.com/@valerielighthart723?si=zmoSJTS9P9QLlgT-",
    heroVideoUrl: "https://youtu.be/B2GC9OtUeaU?t=187",
    photoUrls: ["/performance/valerie-lighthart-spacebar-2026-01-29/01.png"],
  },
  {
    slug: "vhs-live-cincinnati-2026",
    title: "VHS Live — Cincinnati",
    primaryArtist: "KJ The Cool Nerd",
    dateDisplay: "Feb 12 2026",
    venue: "Fuel Lounge OTR",
    city: "Cincinnati",
    state: "OH",
    roles: ["Drums", "Playback"],
    artistUrl: "https://youtube.com/@kjthecoolnerd614?si=45vbhjhTGCZ1TQ1E",
    heroVideoUrl: "https://www.youtube.com/watch?v=Om7g2U6bd8Q&t=744",
    responsibilities: [
      "Ran playback while performing drums, maintaining tight transitions and consistent tempo.",
      "Prepared and organized playback sessions for reliable live execution.",
      "Rehearsed and locked arrangements with the artist to translate the record accurately to the stage.",
      "Coordinated setup and soundcheck efficiently for a smooth changeover.",
    ],
    photoUrls: ["/performance/vhs-live-cincinnati-2026/01.jpg", "/performance/vhs-live-cincinnati-2026/02.JPG", "/performance/vhs-live-cincinnati-2026/03.JPG"],
  },
  {
    slug: "template-2",
    title: "SHOW TITLE",
    primaryArtist: "PRIMARY ARTIST",
    dateDisplay: "Mar 2022",
    venue: "Bluestone",
    city: "Columbus",
    state: "OH",
    roles: ["Drums", "Playback"],
    responsibilities: [
      "Kept the show tight with clean cues and consistent tempo maps.",
      "Supported the artist with steady dynamics and punchy transitions.",
      "Managed quick changeovers while keeping playback stable.",
    ],
    photoUrls: [
      "/projects/template/Missin U.jpg",
      "/projects/template/Missin U.jpg",
      "/projects/template/Missin U.jpg",
    ],
  },
];
