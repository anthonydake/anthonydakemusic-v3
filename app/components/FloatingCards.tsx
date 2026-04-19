"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  type MotionStyle,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface FloatingCard {
  slug: string;
  src: string;
  artist: string;
  title: string;
  depth: number;
  left: string;
  top: string;
  size: "sm" | "md" | "lg";
  opacity: number;
}

const CARDS: FloatingCard[] = [
  {
    slug: "aura",
    src: "/placements/aura.jpg",
    artist: "AR!YAH",
    title: "Aura",
    depth: 1.2,
    left: "8%",
    top: "15%",
    size: "lg",
    opacity: 0.7,
  },
  {
    slug: "missin-u",
    src: "/placements/missin-u.jpg",
    artist: "KJ The Cool Nerd",
    title: "Missin U",
    depth: 0.6,
    left: "75%",
    top: "10%",
    size: "sm",
    opacity: 0.6,
  },
  {
    slug: "morning-coffee",
    src: "/placements/morning-coffee.jpg",
    artist: "BittyOTW",
    title: "Morning Coffee",
    depth: 1.5,
    left: "5%",
    top: "55%",
    size: "md",
    opacity: 0.75,
  },
  {
    slug: "dark-knight",
    src: "/placements/dark-knight.jpg",
    artist: "KJ & WANYEH",
    title: "Dark Knight",
    depth: 0.8,
    left: "80%",
    top: "50%",
    size: "lg",
    opacity: 0.65,
  },
  {
    slug: "get-down",
    src: "/placements/get-down.jpg",
    artist: "Jae Esquire",
    title: "Get Down",
    depth: 1.0,
    left: "12%",
    top: "78%",
    size: "sm",
    opacity: 0.7,
  },
  {
    slug: "back-and-forth",
    src: "/placements/back-and-forth.jpg",
    artist: "Madelyn Leona",
    title: "Back & Forth",
    depth: 1.4,
    left: "72%",
    top: "82%",
    size: "md",
    opacity: 0.8,
  },
];

const SIZE_MAP = {
  sm: { desktop: 80, mobile: 56 },
  md: { desktop: 120, mobile: 80 },
  lg: { desktop: 160, mobile: 100 },
} as const;

const PARALLAX_STRENGTH = 20;

export default function FloatingCards() {
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 50, damping: 30 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    setIsMobile(mobileQuery.matches);
    setReducedMotion(motionQuery.matches);

    const handleMobile = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const handleMotion = (e: MediaQueryListEvent) =>
      setReducedMotion(e.matches);

    mobileQuery.addEventListener("change", handleMobile);
    motionQuery.addEventListener("change", handleMotion);

    return () => {
      mobileQuery.removeEventListener("change", handleMobile);
      motionQuery.removeEventListener("change", handleMotion);
    };
  }, []);

  useEffect(() => {
    if (isMobile || reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const normalizedX =
        (e.clientX / window.innerWidth) * 2 - 1;
      const normalizedY =
        (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile, reducedMotion, mouseX, mouseY]);

  const parallaxDisabled = isMobile || reducedMotion;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {CARDS.map((card) => (
        <FloatingCardItem
          key={card.slug}
          card={card}
          smoothX={smoothX}
          smoothY={smoothY}
          isMobile={isMobile}
          parallaxDisabled={parallaxDisabled}
        />
      ))}
    </div>
  );
}

function FloatingCardItem({
  card,
  smoothX,
  smoothY,
  isMobile,
  parallaxDisabled,
}: {
  card: FloatingCard;
  smoothX: ReturnType<typeof useSpring>;
  smoothY: ReturnType<typeof useSpring>;
  isMobile: boolean;
  parallaxDisabled: boolean;
}) {
  const px = isMobile ? SIZE_MAP[card.size].mobile : SIZE_MAP[card.size].desktop;

  const style: MotionStyle = parallaxDisabled
    ? {
        left: card.left,
        top: card.top,
        width: px,
        height: px,
        opacity: card.opacity,
      }
    : {
        left: card.left,
        top: card.top,
        width: px,
        height: px,
        opacity: card.opacity,
        x: useCardTransform(smoothX, card.depth),
        y: useCardTransform(smoothY, card.depth),
      };

  return (
    <motion.div
      className="pointer-events-auto absolute"
      style={style}
      whileHover={{ scale: 1.05, opacity: 1 }}
      transition={{ type: "tween", duration: 0.25 }}
    >
      <Link
        href={`/placements/${card.slug}`}
        className="group relative block h-full w-full overflow-hidden rounded-2xl shadow-md transition-opacity duration-300 hover:opacity-100"
        aria-label={`${card.title} by ${card.artist}`}
      >
        <Image
          src={card.src}
          alt={`${card.title} — ${card.artist}`}
          fill
          sizes={`${px}px`}
          className="object-cover"
          loading="lazy"
        />
      </Link>
    </motion.div>
  );
}

/**
 * Derives a spring-driven pixel offset for one axis.
 * smoothVal is the normalized mouse position (-1..1) run through useSpring.
 */
function useCardTransform(
  smoothVal: ReturnType<typeof useSpring>,
  depth: number,
) {
  const offset = useMotionValue(0);

  useEffect(() => {
    const unsubscribe = smoothVal.on("change", (v: number) => {
      offset.set(v * depth * PARALLAX_STRENGTH);
    });
    return unsubscribe;
  }, [smoothVal, depth, offset]);

  return offset;
}
