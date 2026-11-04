// Real quotes only. Get written permission from each person before adding them here.
// Activate by adding entries — the About page renders nothing while this array is empty.
// PLACEHOLDERS — not real people. Replace before sharing the About page.
export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;      // e.g. "Music Director", "Producer", "Artist"
  context?: string;  // e.g. "Madelyn Leona — 'Back & Forth'"
}

export const testimonials: Testimonial[] = [
  {
    id: "placeholder-1",
    quote: "Showed up prepared, locked in on the first pass, and made the whole band sound better. That is rare.",
    name: "Placeholder Name",
    role: "Music Director",
    context: "Placeholder — replace with a real quote",
  },
  {
    id: "placeholder-2",
    quote: "I sent rough demos at midnight and had finished drums back by noon. The feel was exactly what the songs needed.",
    name: "Placeholder Name",
    role: "Producer",
    context: "Placeholder — replace with a real quote",
  },
  {
    id: "placeholder-3",
    quote: "He listens. Every fill and every dynamic choice serves the song, and the room follows him.",
    name: "Placeholder Name",
    role: "Artist",
  },
];
