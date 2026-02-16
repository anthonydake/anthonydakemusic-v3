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
  artistLinks?: { label: string; url: string }[];
  heroVideoUrl?: string;
  responsibilities?: string[];
  listenLinks?: { label: string; url: string }[];
  photoUrls?: string[];
};

export const performanceIndex: PerformanceItem[] = [
  {
    slug: "bobby-floyd-trio-anthony-dake-sits-in-2022-06-26",
    title: "Bobby Floyd Trio | Anthony Dake Sits In",
    primaryArtist: "Bobby Floyd Trio",
    dateDisplay: "Jun 26 2022",
    venue: "Natalie's Grandview, 945 King Ave",
    city: "Columbus",
    state: "OH",
    roles: ["Drums"],
    artistUrl: "https://www.jazzartsgroup.org/hire-a-band/artist-directory/bobby-floyd/",
    heroVideoUrl: "https://www.youtube.com/watch?v=5H5tw_vdkg4&t=272s",
    responsibilities: ["Drums"],
    photoUrls: ["/performance/bobby-floyd-trio-anthony-dake-sits-in-2022-06-26/01.png"],
  },
  {
    slug: "duality-2022-10-08",
    title: "D . U . A . L . I . T . Y .",
    primaryArtist: "Anthony Dake",
    dateDisplay: "Oct 8 2022",
    venue: "Mees Hall",
    city: "Columbus",
    state: "OH",
    roles: ["Drums", "Percussion", "MD"],
    artistUrl: "https://youtube.com/@anthony_dake?si=JXmVpa0e1XbzeH9s",
    heroVideoUrl: "/performance/duality-2022-10-08/pink-rhino.gif",
    responsibilities: ["Drums", "Percussion", "MD"],
    photoUrls: ["/performance/duality-2022-10-08/01.jpg"],
  },
  {
    slug: "main-street-music-festival-2022-05-10",
    title: "Main Street Music Festival",
    primaryArtist: "KJ The Cool Nerd",
    dateDisplay: "May 10 2022",
    venue: "Yochum Hall, 2315 E. Mound St.",
    city: "Columbus",
    state: "OH",
    roles: ["Drums"],
    artistUrl: "https://youtube.com/@kjthecoolnerd614?si=45vbhjhTGCZ1TQ1E",
    heroVideoUrl: "https://www.youtube.com/watch?v=3LGtry8famg&t=135s",
    responsibilities: ["Drums"],
    photoUrls: ["/performance/main-street-music-festival-2022-05-10/01.jpg"],
  },
  {
    slug: "rock-of-ages-short-north-stage-2022-07-21",
    title: "Rock of Ages",
    primaryArtist: "Short North Stage",
    dateDisplay: "Jul 21 2022 – Aug 14 2022",
    venue: "The Garden Theatre, 1187 N. High St.",
    city: "Columbus",
    state: "OH",
    roles: ["Drums", "Percussion"],
    artistUrl: "https://shortnorthstage.org",
    heroVideoUrl: "https://www.youtube.com/watch?v=4jelx3r16m8",
    responsibilities: ["Drums", "Percussion"],
    photoUrls: ["/performance/rock-of-ages-short-north-stage-2022-07-21/01.jpg"],
  },
  {
    slug: "whitehall-food-truck-festival-2025-07-26",
    title: "Whitehall Food Truck Festival",
    primaryArtist: "KJ The Cool Nerd & WANYEH",
    dateDisplay: "Jul 26 2025",
    venue: "John Bishop Park",
    city: "Whitehall",
    state: "OH",
    roles: ["Drums"],
    artistLinks: [
      {
        label: "KJ The Cool Nerd",
        url: "https://youtube.com/@kjthecoolnerd614?si=45vbhjhTGCZ1TQ1E",
      },
      {
        label: "WANYEH",
        url: "https://www.instagram.com/wanyeh_003/",
      },
    ],
    heroVideoUrl: "https://www.youtube.com/watch?v=lhji4B7krzU&t=1321s",
    responsibilities: ["Drums"],
    photoUrls: ["/performance/whitehall-food-truck-festival-2025-07-26/01.png"],
  },
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
];
