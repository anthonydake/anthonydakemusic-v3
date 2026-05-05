"use client";

import { useEffect, useMemo, useState } from "react";
import TextScramble from "./TextScramble";

function formatColumbusTime(d: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return fmt.format(d);
}

export default function ColumbusTime({
  className = "",
  duration = 500,
  charset = "#%&$@+|",
  scrambleFraction = 0.35,
}: {
  className?: string;
  duration?: number;
  charset?: string;
  scrambleFraction?: number;
}) {
  const [now, setNow] = useState(() => new Date());
  const [trigger, setTrigger] = useState(0);

  useEffect(() => {
    let timeoutId: number | undefined;

    const scheduleNext = () => {
      const current = new Date();
      const msUntilNextMinute =
        (60 - current.getSeconds()) * 1000 - current.getMilliseconds();

      timeoutId = window.setTimeout(() => {
        setNow(new Date());
        setTrigger((t) => t + 1);
        scheduleNext();
      }, Math.max(0, msUntilNextMinute));
    };

    scheduleNext();

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  const timeLabel = useMemo(() => formatColumbusTime(now), [now]);

  return (
    <TextScramble
      className={className}
      text={timeLabel}
      duration={duration}
      charset={charset}
      scrambleFraction={scrambleFraction}
      trigger={trigger}
      leftToRight
    />
  );
}
