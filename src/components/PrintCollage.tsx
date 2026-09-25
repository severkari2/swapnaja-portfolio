"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// A stop-motion pile of photo prints, after the designer's "Archive Collage.mp4": prints are
// laid on the pile one at a time, full size or as a smaller tilted print, nudged, and peeled
// back off again. Every change is a hard cut, held for as many frames as the video holds it,
// but each frame lasts FRAME_MS instead of 1/30s, so a print can be seen before the next one
// lands. After the last state the pile fades out and the loop starts again.

/** One frame of the 30fps video, slowed 3×. The holds keep the video's uneven rhythm. */
const FRAME_MS = 100;
/** The fade out, and back in, between two runs of the loop. */
const FADE_MS = 600;
/** Start anyway if some photo never reports loaded. */
const READY_TIMEOUT_MS = 4000;

// Measured off the video's frames: centre x and width in % of the collage's width, centre y
// in % of its height, rotation in degrees. Every print is 3:4.
type Pose = readonly [x: number, y: number, width: number, rotate: number];

interface Sheet {
  /** Index into `photos`, wrapped when a set has fewer photos. */
  photo: number;
  pose: Pose;
  /** A smaller print laid on the pile, with a wider white border. */
  inset?: boolean;
  /** A paper clip over the top edge. */
  clip?: boolean;
}

const SHEETS = {
  // The pile the video starts on: only its edges ever show.
  base1: { photo: 8, pose: [51, 50.5, 88, 0.6] },
  base2: { photo: 6, pose: [50, 51.5, 88, -0.9] },
  base3: { photo: 2, pose: [51.5, 50.8, 88, 1.5] },
  a: { photo: 0, pose: [52, 47, 88, 0] },
  b: { photo: 1, pose: [63, 61, 55, -1], inset: true },
  c: { photo: 2, pose: [48.7, 51, 89, -3.5] },
  c2: { photo: 2, pose: [49, 50.6, 90, -6] },
  d: { photo: 3, pose: [32, 35, 50, -5], inset: true, clip: true },
  e: { photo: 4, pose: [49, 49.5, 88, 1] },
  f: { photo: 5, pose: [58, 57, 52, 8.3], inset: true },
  g: { photo: 6, pose: [52, 50.5, 89, 3] },
  h: { photo: 7, pose: [54, 53.5, 88, 0] },
  i: { photo: 8, pose: [51.5, 53.5, 88, 0.3] },
  // j and k are shuffled around on top of i: each pose is a separate sheet.
  j1: { photo: 9, pose: [42.7, 43.5, 54, -4], inset: true },
  j2: { photo: 9, pose: [46, 47, 54, -9], inset: true },
  j3: { photo: 9, pose: [49, 48, 54, -1], inset: true },
  k1: { photo: 10, pose: [63.6, 60.6, 54, 6], inset: true },
  k2: { photo: 10, pose: [64, 64, 54, 17], inset: true },
  k3: { photo: 10, pose: [60, 59, 54, 6], inset: true },
  k4: { photo: 10, pose: [54, 54.6, 54, 7], inset: true },
  k5: { photo: 10, pose: [52.8, 54.3, 52, -4], inset: true },
  l: { photo: 11, pose: [52, 47, 89, 1] },
  // A one-frame flash in the video.
  m: { photo: 5, pose: [53, 48, 88, 0.5] },
  n: { photo: 12, pose: [52.6, 48, 88, 1] },
  o: { photo: 13, pose: [49, 49.5, 88, -0.5] },
} satisfies Record<string, Sheet>;

type SheetId = keyof typeof SHEETS;

const PILE: SheetId[] = ["base1", "base2", "base3"];

// Each state of the video's second (complete) play, frames 178–338: how many frames it
// holds, and the prints on the pile, bottom to top.
const STATES: { hold: number; top: SheetId[] }[] = [
  { hold: 6, top: ["a"] },
  { hold: 6, top: ["a", "b"] },
  { hold: 9, top: ["a", "b", "c"] },
  { hold: 10, top: ["a", "b", "c", "d"] },
  { hold: 5, top: ["a", "b", "c", "d", "e", "f"] },
  { hold: 4, top: ["a", "b", "c", "d", "e", "f", "g"] },
  { hold: 4, top: ["a", "b", "c", "d", "e", "f", "g", "h"] },
  { hold: 9, top: ["a", "b", "c", "d", "e", "f", "g", "h", "i"] },
  { hold: 8, top: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "k1", "j1"] },
  { hold: 9, top: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j2", "k2"] },
  { hold: 1, top: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j3", "k3"] },
  { hold: 5, top: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j3", "k4"] },
  { hold: 2, top: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "k5"] },
  { hold: 8, top: ["a", "b", "c", "d", "e", "f", "g", "h", "i"] },
  { hold: 7, top: ["a", "b", "c", "d", "e", "f", "g", "h"] },
  { hold: 8, top: ["a", "b", "c", "d", "e", "f"] },
  { hold: 9, top: ["a", "b", "c", "d", "e"] },
  { hold: 6, top: ["a", "b", "c2"] },
  { hold: 2, top: ["l"] },
  { hold: 8, top: ["a", "b"] },
  { hold: 5, top: ["a"] },
  { hold: 1, top: ["m"] },
  { hold: 9, top: ["n"] },
  { hold: 20, top: ["o"] },
];

/** Shown, without motion, under prefers-reduced-motion: the fullest pile. */
const STILL = 8;

const SHEET_IDS = Object.keys(SHEETS) as SheetId[];
const OPENING: SheetId[] = [...PILE, ...STATES[0].top];

// The shadow is in cqw of the collage, so it scales with the prints.
const sheetStyle: CSSProperties = {
  background:
    "linear-gradient(160deg, var(--pc-print), color-mix(in srgb, var(--pc-print) 94%, var(--ink)))",
  boxShadow: [
    "0 0.1cqw 0.25cqw color-mix(in srgb, var(--ink) 24%, transparent)",
    "0 0.7cqw 1.8cqw -0.4cqw color-mix(in srgb, var(--ink) 24%, transparent)",
  ].join(", "),
};

// A faint sheen across the photo, as off a print's surface, and a hairline where the photo
// meets its border.
const sheenStyle: CSSProperties = {
  background:
    "linear-gradient(118deg, color-mix(in srgb, white 16%, transparent), transparent 38%, transparent 66%, color-mix(in srgb, var(--ink) 7%, transparent))",
  boxShadow: "inset 0 0 0 0.5px color-mix(in srgb, var(--ink) 12%, transparent)",
};

const reducedMotion = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotion);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function PrintCollage({
  photos,
  label,
  eager = false,
  className = "",
}: {
  photos: string[];
  label: string;
  /** Load the opening pile at once, for a collage above the fold. */
  eager?: boolean;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [fading, setFading] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const still = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotion).matches,
    () => false,
  );

  const ready = loaded >= SHEET_IDS.length || timedOut;
  const running = onScreen && ready && !still;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!onScreen || ready) return;
    const timer = setTimeout(() => setTimedOut(true), READY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [onScreen, ready]);

  useEffect(() => {
    if (!running) return;
    // A paused hold starts over when the collage comes back into view.
    const timer = fading
      ? setTimeout(() => {
          setStep(0);
          setFading(false);
        }, FADE_MS)
      : setTimeout(() => {
          if (step < STATES.length - 1) setStep(step + 1);
          else setFading(true);
        }, STATES[step].hold * FRAME_MS);
    return () => clearTimeout(timer);
  }, [running, step, fading]);

  const shown = still ? STILL : step;
  const stack = [...PILE, ...STATES[shown].top];

  return (
    <div
      ref={root}
      role="img"
      aria-label={label}
      className={`@container relative [--pc-print:color-mix(in_srgb,white_72%,var(--paper))] ${className}`}
    >
      <div
        className="absolute inset-0 transition-opacity ease-in-out"
        style={{
          opacity: fading ? 0 : 1,
          transitionDuration: `${FADE_MS}ms`,
        }}
      >
        {SHEET_IDS.map((id) => {
          const sheet: Sheet = SHEETS[id];
          const [x, y, width, rotate] = sheet.pose;
          const layer = stack.indexOf(id);
          return (
            <div
              key={id}
              className="@container absolute aspect-[3/4]"
              style={{
                ...sheetStyle,
                left: `${x}%`,
                top: `${y}%`,
                width: `${width}%`,
                transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
                zIndex: layer + 1,
                // Hidden rather than unmounted, so every photo is loaded before it's cut to.
                opacity: layer < 0 ? 0 : 1,
              }}
            >
              <div
                className={`absolute overflow-hidden ${sheet.inset ? "inset-[3.4cqw]" : "inset-[1.6cqw]"}`}
              >
                <Image
                  src={photos[sheet.photo % photos.length]}
                  alt=""
                  fill
                  // A full-size print is 88% of the collage, 603/1400 of the page from lg up.
                  sizes="(min-width: 1024px) 38vw, 425px"
                  loading={eager && OPENING.includes(id) ? "eager" : "lazy"}
                  onLoad={() => setLoaded((n) => n + 1)}
                  className="object-cover"
                />
                <span aria-hidden className="absolute inset-0" style={sheenStyle} />
              </div>
              {sheet.clip && <PaperClip />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PaperClip() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 14 44"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinecap="round"
      className="absolute left-[73%] top-[-7%] w-[8%] text-ink/70 [filter:drop-shadow(0_0.3cqw_0.3cqw_color-mix(in_srgb,var(--ink)_25%,transparent))]"
    >
      <path d="M4.5 14V33a2.5 2.5 0 0 0 5 0V5.5a4 4 0 0 0-8 0v31a5.5 5.5 0 0 0 11 0V12" />
    </svg>
  );
}
