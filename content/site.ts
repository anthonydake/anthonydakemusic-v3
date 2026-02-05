export type Reel = {
  title: string;
  src: string; // embed URL (iframe src) or direct media URL
  platform: "youtube" | "vimeo" | "spotify" | "apple_music" | "soundcloud";
  role: string;
  tags: string[];
};

export type FeaturedWork = {
  slug: string; // should match /projects/[slug]
  title: string;
  client: string;
  year: number;
  roles: string[];
  summary: string;
  mediaEmbeds: Array<{
    platform: "youtube" | "vimeo" | "spotify" | "apple_music" | "soundcloud";
    src: string; // iframe src
    title?: string;
    height?: number;
  }>;
  results: string[];
  testimonial?: {
    quote: string;
    name: string;
    title?: string;
  };
};

export type Service = {
  title: string;
  bullets: string[];
  timeline: string;
  revisions: string;
  startingPrice?: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  title: string;
  project?: string;
};

export type ContactField =
  | {
      name:
        | "name"
        | "email"
        | "phone"
        | "artist"
        | "timeline"
        | "budget"
        | "links"
        | "source";
      label: string;
      placeholder?: string;
      type?: "text" | "email" | "tel";
      required?: boolean;
    }
  | {
      name: "details";
      label: string;
      placeholder?: string;
      required?: boolean;
      kind: "textarea";
      rows?: number;
    };

export type SiteContent = {
  hero: {
    headline: string;
    subheadline: string;
    cta: { label: string; href: string };
  };
  reels: Reel[];
  featuredWork: FeaturedWork[];
  services: Service[];
  testimonials: Testimonial[];
  contact: {
    email: string;
    responseTime: string;
    services: string[];
    fields: ContactField[];
  };
};

export const site = {
  hero: {
    headline: "Anthony Dake — Architect of Sound",
    subheadline: "Production, drums, and music direction with a systems-first mindset that still feels human.",
    cta: { label: "Contact", href: "/contact" },
  },

  reels: [],

  featuredWork: [],

  services: [
    {
      title: "PRODUCTION/SONGWRITING",
      bullets: ["Arrangement + song structure", "Session direction + tracking", "Editing + comping + delivery-ready sessions"],
      timeline: "Varies by scope (typical: 2–6 weeks).",
      revisions: "Two revision passes included.",
    },
    {
      title: "MIXING/MASTERING",
      bullets: ["Mixing with clear delivery specs", "Stems/alt versions on request", "Mastering for streaming + sync"],
      timeline: "Typical: 3–7 days per song after delivery of assets.",
      revisions: "One revision pass included.",
    },
    {
      title: "DRUMS",
      bullets: ["Remote session drums", "Hybrid kit design + samples", "Tight delivery + tempo maps"],
      timeline: "Typical: 1–3 days per song.",
      revisions: "One pickup pass included.",
    },
    {
      title: "MUSICAL DIRECTION",
      bullets: ["Show design + cues", "Playback system planning", "Rehearsal leadership + execution support"],
      timeline: "Typical: 2–8 weeks depending on tour/production window.",
      revisions: "Iterative during rehearsal cycle.",
    },
  ],

  testimonials: [],

  contact: {
    email: "booking@anthonydakemusic.com",
    responseTime: "Usually replies within 24–48 hours.",
    services: ["Production", "Session Drums", "Music Direction", "Playback Systems", "Other"],
    fields: [
      { name: "name", label: "Name", placeholder: "Your name", required: true },
      { name: "email", label: "Email", type: "email", placeholder: "you@email.com", required: true },
      { name: "phone", label: "Phone (optional)", placeholder: "+1 (---) --- ----", type: "tel" },
      { name: "artist", label: "Artist / Band", placeholder: "If applicable" },
      { name: "timeline", label: "Timeline / deadline", placeholder: "e.g., Master by May 12" },
      { name: "budget", label: "Budget range", placeholder: "$" },
      { name: "links", label: "Links (references, demos, Dropbox/Drive, stems)", placeholder: "Paste URLs" },
      { name: "source", label: "Where did you find me?", placeholder: "Referral, social, show, etc." },
      {
        name: "details",
        kind: "textarea",
        label: "Project description",
        required: true,
        rows: 6,
        placeholder: "What you're building, roles needed, references, deliverables, non-negotiables.",
      },
    ],
  },
} as const satisfies SiteContent;

export default site;

