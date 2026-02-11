"use client";

import { AnimatePresence, motion } from "framer-motion";

type TransitionMode = "curtain" | "fade";
type TransitionPhase = "idle" | "covering" | "revealing";

export default function CurtainOverlay({
  phase,
  mode,
  onCoverComplete,
  onRevealComplete,
}: {
  phase: TransitionPhase;
  mode: TransitionMode;
  onCoverComplete: () => void;
  onRevealComplete: () => void;
}) {
  const isActive = phase !== "idle";

  const variants =
    mode === "curtain"
      ? {
          initial: { y: "100%" },
          covering: { y: "0%" },
          revealing: { y: "-100%" },
        }
      : {
          initial: { opacity: 0 },
          covering: { opacity: 1 },
          revealing: { opacity: 0 },
        };

  const transition =
    mode === "curtain"
      ? { duration: 0.8, ease: [0.19, 1, 0.22, 1] as [number, number, number, number] }
      : { duration: 0.4, ease: "easeInOut" as const };

  return (
    <AnimatePresence>
      {isActive ? (
        <motion.div
          key="curtain-overlay"
          className="fixed inset-0 z-[10000]"
          style={{
            background:
              "radial-gradient(120% 140% at 50% 120%, rgba(14,14,14,0.9) 0%, rgba(6,6,6,0.96) 45%, #000 100%), linear-gradient(to top, #000000 0%, #050505 60%, #0A0A0A 100%)",
          }}
          initial="initial"
          animate={phase}
          variants={variants}
          transition={transition}
          onAnimationComplete={() => {
            if (phase === "covering") onCoverComplete();
            if (phase === "revealing") onRevealComplete();
          }}
        />
      ) : null}
    </AnimatePresence>
  );
}
