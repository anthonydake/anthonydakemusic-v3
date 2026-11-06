import Image from "next/image";
import { testimonials } from "../../data/testimonials.data";

export default function Testimonials() {
  if (testimonials.length === 0) return null;
  const items = testimonials.slice(0, 3);

  return (
    <section aria-labelledby="testimonials-heading" className="mx-auto mt-20 max-w-[420px]">
      <h2 id="testimonials-heading" className="mb-10 text-center text-[15px] text-[#F2F2F2]">
        What people say
      </h2>
      <div className="space-y-12">
        {items.map((t) => (
          <figure key={t.id}>
            <Image
              src={t.image}
              alt={t.alt}
              width={t.width}
              height={t.height}
              loading="lazy"
              sizes="(max-width: 420px) 100vw, 380px"
              className="h-auto w-full max-w-[380px] mx-auto select-none"
            />
            <figcaption className="mt-3 text-[12px] text-[#5C5C5C] text-center">
              {t.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
