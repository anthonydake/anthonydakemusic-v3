import { testimonials } from "../../data/testimonials.data";

export default function Testimonials() {
  if (testimonials.length === 0) return null;
  const items = testimonials.slice(0, 3);

  return (
    <section aria-labelledby="testimonials-heading" className="mt-20 mb-12">
      <p
        id="testimonials-heading"
        className="mb-12 text-center text-[11px] uppercase tracking-[0.25em] text-white/25"
      >
        <span>What People Say</span>
      </p>
      <div className="space-y-12">
        {items.map((t) => (
          <blockquote key={t.id} className="mx-auto max-w-[580px] text-center">
            <p className="text-[16px] italic leading-[1.8] text-[#BFBFBF] sm:text-[18px]">
              <span>&ldquo;{t.quote}&rdquo;</span>
            </p>
            <footer className="mt-4">
              <p className="text-[13px] font-medium text-[#F2F2F2]">
                <span>{t.name}</span>
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-white/30">
                <span>
                  {t.role}
                  {t.context ? ` · ${t.context}` : ""}
                </span>
              </p>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
