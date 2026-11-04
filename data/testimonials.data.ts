// Real quotes only. Get written permission from each person before adding them here.
// Activate by adding entries — the About page renders nothing while this array is empty.
export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;      // e.g. "Music Director", "Producer", "Artist"
  context?: string;  // e.g. "Madelyn Leona — 'Back & Forth'"
}

export const testimonials: Testimonial[] = [
  // { id: "example", quote: "…", name: "First Last", role: "Music Director", context: "Tour / project" },
];
