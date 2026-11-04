import { testimonials } from "../../data/testimonials.data";

export default function Testimonials() {
  if (testimonials.length === 0) return null;
  const items = testimonials.slice(0, 3);

  return (
    <section aria-labelledby="testimonials-heading" className="mx-auto mt-20 max-w-[640px]">
      <h2 id="testimonials-heading" className="mb-10 text-center text-[15px] text-[#F2F2F2]">
        What people say
      </h2>
      <div className="space-y-10">
        {items.map((t) => (
          <blockquote key={t.id} className="text-center">
            <p className="text-[16px] italic leading-[1.75] text-[#BFBFBF] sm:text-[18px]">
              &ldquo;{t.quote}&rdquo;
            </p>
            <footer className="mt-4">
              <p className="text-[13px] text-[#F2F2F2]">{t.name}</p>
              <p className="mt-1 text-[12px] text-[#5C5C5C]">
                {t.role}
                {t.context ? ` · ${t.context}` : ""}
              </p>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
