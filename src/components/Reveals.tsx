"use client";

import { useEffect, useRef } from "react";

// Plays the timed entrances on a project page (project-motion.css): every element inside
// with `data-reveal` gets `data-shown` once it rises a little way into the screen, and keeps
// it. The hidden states only apply once this has mounted (`data-reveals`), so the page reads
// in full without script, and nothing is hidden under prefers-reduced-motion.
//
// Renders a `display: contents` wrapper, so it adds no box to the layout.
export function Reveals({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.shown = "";
          io.unobserve(entry.target);
        }
      },
      // Once its top is 12% of the screen up from the bottom.
      { rootMargin: "0px 0px -12% 0px" }
    );
    el.querySelectorAll("[data-reveal]").forEach((target) => io.observe(target));
    el.dataset.reveals = "";
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root} className="contents">
      {children}
    </div>
  );
}
