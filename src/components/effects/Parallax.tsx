"use client";

import { useRef, type ReactNode } from "react";
import { bewegungErlaubt } from "@/lib/motion";

/**
 * Die Fotos im Startbild folgen dem Mauszeiger ein kleines Stück (je Ebene verschieden weit,
 * `data-tiefe` in globals.css). Ohne Maus, mit „Bewegung reduzieren“ oder „Bewegung“ aus bleibt alles still.
 */
export function Parallax({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    if (!bewegungErlaubt()) return onLeave();
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const onLeave = () => {
    ref.current?.style.setProperty("--px", "0");
    ref.current?.style.setProperty("--py", "0");
  };
  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`gh-parallax ${className}`}>
      {children}
    </div>
  );
}
