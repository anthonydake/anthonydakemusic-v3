"use client";

import { useEffect, useRef, useState } from "react";

const CLICKABLE_SELECTOR =
  'a, button, [role="button"], [data-clickable="true"], input, textarea, select, option, [tabindex]:not([tabindex="-1"])';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const lastPos = useRef({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);
  const clickableRef = useRef(false);
  const clickAnimTimeout = useRef<NodeJS.Timeout | null>(null);

  const [clickable, setClickable] = useState(false);
  const [visible, setVisible] = useState(false);
  const [clickPulse, setClickPulse] = useState(false);

  useEffect(() => {
    const updateTransform = () => {
      if (cursorRef.current) {
        const { x, y } = lastPos.current;
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      }
      frame.current = null;
    };

    const onMove = (e: MouseEvent) => {
      lastPos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      const target = e.target as HTMLElement | null;
      const isHit = Boolean(target?.closest(CLICKABLE_SELECTOR));
      if (isHit !== clickableRef.current) {
        clickableRef.current = isHit;
        setClickable(isHit);
      }

      if (!frame.current) frame.current = requestAnimationFrame(updateTransform);
    };

    const onLeave = () => setVisible(false);

    const onDown = () => {
      if (clickAnimTimeout.current) clearTimeout(clickAnimTimeout.current);
      setClickPulse(true);
      clickAnimTimeout.current = setTimeout(() => setClickPulse(false), 200);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseenter", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave, { passive: true });
    window.addEventListener("mousedown", onDown, { passive: true });

    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
       if (clickAnimTimeout.current) clearTimeout(clickAnimTimeout.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseenter", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
    };
  }, [visible]);

  const size = 8;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-[99998] transition-opacity duration-100"
      style={{
        opacity: visible ? 1 : 0,
        transform: "translate3d(-999px, -999px, 0)",
        willChange: "transform",
      }}
    >
      <div
        className={`relative flex items-center justify-center transition-transform duration-140 ${
          clickable ? "scale-[1.2]" : ""
        } ${clickPulse ? "scale-[0.84]" : ""}`}
        style={{ width: size, height: size }}
      >
        <span
          className="absolute inset-0 rounded-full bg-white"
          style={{ boxShadow: "0 0 8px rgba(255, 255, 255, 0.6)" }}
        />
      </div>
    </div>
  );
}
