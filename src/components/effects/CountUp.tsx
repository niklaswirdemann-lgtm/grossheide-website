"use client";

import { useEffect, useRef, useState } from "react";
import { bewegungErlaubt } from "@/lib/motion";

/**
 * Zahl zählt beim ersten Erscheinen hoch (rund 1,2 s). Screenreader lesen immer den Endwert
 * (sr-only), die laufende Zahl ist nur Schmuck. Ohne JavaScript, mit „Bewegung reduzieren“ oder „Bewegung“ aus
 * steht sofort der Endwert da.
 */
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || !bewegungErlaubt()) return;
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / 1200);
          setShown(Math.round(value * (1 - (1 - t) ** 3)));
          if (t < 1) frame = requestAnimationFrame(step);
        };
        setShown(0);
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);
  return (
    <span ref={ref}>
      <span aria-hidden="true">
        {shown}
        {suffix}
      </span>
      <span className="sr-only">
        {value}
        {suffix}
      </span>
    </span>
  );
}
