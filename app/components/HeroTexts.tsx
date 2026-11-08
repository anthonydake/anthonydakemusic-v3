import Image from "next/image";
import { HERO_TESTIMONIALS } from "../../data/testimonials.data";

export default function HeroTexts() {
  return (
    <ul
      aria-label="What people say"
      className="-mx-6 mt-8 flex snap-x snap-mandatory items-start gap-4 overflow-x-auto px-6 pb-1 [scroll-padding-left:1.5rem] md:mx-auto md:mt-8 md:grid md:w-full md:max-w-[500px] md:snap-none md:grid-cols-2 md:gap-x-5 md:gap-y-4 md:overflow-visible md:px-0 md:pb-0 short:mt-5 short:max-w-[440px] tiny:mt-4 tiny:max-w-[420px]"
    >
      {HERO_TESTIMONIALS.map((t) => (
        <li
          key={t.id}
          className="w-[72vw] max-w-[300px] shrink-0 snap-center md:w-full md:max-w-none"
        >
          <figure className="flex flex-col items-center">
            <Image
              src={t.image}
              alt={t.alt}
              width={t.width}
              height={t.height}
              loading="lazy"
              sizes="(max-width: 768px) 72vw, 260px"
              className="h-auto w-full select-none"
            />
            <figcaption className="mt-1.5 text-center text-[11px] leading-[1.4] text-[#5C5C5C]">
              {t.caption}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
