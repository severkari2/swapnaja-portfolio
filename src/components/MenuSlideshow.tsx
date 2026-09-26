"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";

// A flip through a printed piece, after the designer's surahi_collage_refrence.mp4: each
// spread is held perfectly still for one second, then hard-cut to the next, with no fade.
// The print look (paper white, mottle, crease, bottom lip) is baked into the images.
const CUT_MS = 1000;

// Where each spread lay in the reference, off centre as a % of its own width and height,
// and turned in degrees: the spreads were placed by hand, never quite in the same spot.
// Slides take these in turn, so every loop repeats the same placement.
const PLACEMENTS = [
  { x: -0.19, y: -0.2, r: 0.02 },
  { x: 0.17, y: 0.15, r: 0.02 },
  { x: -0.17, y: 0.44, r: -0.15 },
  { x: -0.01, y: -0.11, r: -0.02 },
  { x: 0.21, y: -0.15, r: 0.03 },
  { x: 0, y: -0.13, r: 0.03 },
];

// The share of the panel a slide may fill: its height, or its width if it is wide.
const FILL_H = 0.84;
const FILL_W = 0.9;

// The panel's shape below lg, where it stacks: taller than the PDF's, so a spread is larger.
// Keep it in step with the aspect-4/3 class on the panel.
const STACKED_ASPECT = 4 / 3;

const reducedMotion = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotion);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function MenuSlideshow({
  label,
  color,
  slides,
  aspect,
  share,
  className = "",
  style,
}: {
  label: string;
  color: string;
  slides: { src: string; aspect: number }[];
  /** The panel's width over its height, from lg up. */
  aspect: number;
  /** The panel's width from lg up, in vw, for the images' `sizes`. */
  share: number;
  className?: string;
  style?: CSSProperties;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const [paused, setPaused] = useState(false);
  const still = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotion).matches,
    () => false,
  );

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const running = onScreen && !paused && !still;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), CUT_MS);
    return () => clearInterval(id);
  }, [running, slides.length]);

  // Held still, it shows the first spread inside the cover, which says more than the cover.
  const shown = still ? Math.min(1, slides.length - 1) : index;

  return (
    <div
      ref={root}
      role="group"
      aria-roledescription="slideshow"
      aria-label={label}
      className={`relative aspect-4/3 overflow-hidden @container-size lg:aspect-auto ${className}`}
      style={{ backgroundColor: color, ...style }}
    >
      {slides.map((slide, i) => {
        const place = PLACEMENTS[i % PLACEMENTS.length];
        const fill = (panel: number) => Math.min(FILL_W, (FILL_H * slide.aspect) / panel);
        return (
          <div
            key={slide.src}
            aria-hidden="true"
            className={`absolute left-1/2 top-1/2 ${i === shown ? "" : "opacity-0"}`}
            style={{
              width: `min(${FILL_W * 100}cqw, ${FILL_H * 100}cqh * ${slide.aspect})`,
              aspectRatio: slide.aspect,
              transform: `translate(-50%, -50%) translate(${place.x}%, ${place.y}%) rotate(${place.r}deg)`,
            }}
          >
            <Image
              src={slide.src}
              alt=""
              fill
              sizes={`(min-width: 1024px) ${(share * fill(aspect)).toFixed(1)}vw, ${Math.round(100 * fill(STACKED_ASPECT))}vw`}
              loading="lazy"
              className="object-cover"
            />
          </div>
        );
      })}

      {!still && (
        // The panel itself pauses and resumes it, so a spread can be stopped on and read.
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? `Play: ${label}` : `Pause: ${label}`}
          className="absolute inset-0 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-paper"
        />
      )}
    </div>
  );
}
