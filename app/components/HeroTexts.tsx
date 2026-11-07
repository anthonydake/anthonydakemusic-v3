import Image from "next/image";
import { HERO_TESTIMONIALS } from "../../data/testimonials.data";

export default function HeroTexts() {
  return (
    <ul
      aria-label="What people say"
      className="mt-10 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-6 pb-1 [scroll-padding-left:1.5rem] md:mx-auto md:mt-14 md:grid md:max-w-[1200px] md:snap-none md:grid-cols-4 md:gap-6 md:overflow-visible md:px-8"
    >
      {HERO_TESTIMONIALS.map((t) => (
        <li
          key={t.id}
          className="w-[72vw] max-w-[300px] shrink-0 snap-center md:w-auto md:max-w-none"
        >
          <figure className="flex flex-col items-center">
            <Image
              src={t.image}
              alt={t.alt}
              width={t.width}
              height={t.height}
              loading="lazy"
              sizes="(max-width: 768px) 72vw, 280px"
              className="h-auto w-full select-none"
            />
            <figcaption className="mt-2 text-center text-[12px] text-[#5C5C5C]">
              {t.caption}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
