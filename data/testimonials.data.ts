// Real client texts, used with each sender's permission. Rendered as the
// cleaned screenshot bubbles that live under /public/reviews/. The `alt`
// string is the full quote text (for screen readers and search); keep it
// verbatim with the image.
export interface Testimonial {
  id: string;
  image: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "live-2026",
    image: "/reviews/review-7.png",
    width: 514,
    height: 168,
    alt: "You're real one for sure. I was very impressed with your drumming man. Fr I'm not gassing you up. You were solid for sure.",
    caption: "Artist · after a live show · via text",
  },
  {
    id: "production-1",
    image: "/reviews/review-4.png",
    width: 498,
    height: 300,
    alt: "Anthony! I am DROOLING! I'm obsessed with this… the production changes really take it up and over! I can definitely give more thought to the lyrics, I really like the melody but am absolutely open to feedback if there's any changes your ear is craving!",
    caption: "Artist · production client · via text",
  },
  {
    id: "beat-1",
    image: "/reviews/review-2.png",
    width: 528,
    height: 205,
    alt: "I LOVE WHAT YOU DID WITH THIS BEAT! Truly fantastic. Ps sorry for the late response, I just got home from the music video shoot! Also Micah says hi!",
    caption: "Artist · beat & production · via text",
  },
];
