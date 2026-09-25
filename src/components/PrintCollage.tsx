"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import {
  useEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

// A stop-motion pile of photo prints, after the designer's "Archive Collage.mp4": prints are
// laid on the pile one at a time, full size or as a smaller tilted print, nudged, and peeled
// back off again. Every change is a hard cut, held for as many frames as the video holds it,
// but each frame lasts FRAME_MS instead of 1/30s, so a print can be seen before the next one
// lands. The choreography lays down 14 prints; a longer set runs it again with the next 14
// (a pass), cut straight on as the video cuts when it loops. After the last pass the pile
// fades out and the loop starts again.

/** One frame of the 30fps video, slowed 3×. The holds keep the video's uneven rhythm. */
const FRAME_MS = 100;
/** The fade out, and back in, between two runs of the loop. */
const FADE_MS = 600;
/** Start anyway if some photo never reports loaded. */
const READY_TIMEOUT_MS = 4000;
/** The distinct prints in one pass of the choreography. */
const SLOTS = 14;

export interface CollageItem {
  /** A photo, or a video's poster frame. 3:4, or 4:3 when `landscape`. */
  src: string;
  landscape?: boolean;
  /** A video, played through on its print before the collage moves on. Bake any
   *  stop-motion frame rate into the file itself. */
  video?: string;
}

// Measured off the video's frames: centre x and width in % of the collage's width, centre y
// in % of its height, rotation in degrees. Prints are 3:4, or 4:3 for a landscape item.
type Pose = readonly [x: number, y: number, width: number, rotate: number];

interface Sheet {
  /** Which of the pass's 14 items it shows. */
  slot: number;
  pose: Pose;
  /** A smaller print laid on the pile, with a wider white border. */
  inset?: boolean;
  /** A paper clip over the top edge. */
  clip?: boolean;
}

const SHEETS = {
  // The pile the video starts on: only its edges ever show.
  base1: { slot: 8, pose: [51, 50.5, 88, 0.6] },
  base2: { slot: 6, pose: [50, 51.5, 88, -0.9] },
  base3: { slot: 2, pose: [51.5, 50.8, 88, 1.5] },
  a: { slot: 0, pose: [52, 47, 88, 0] },
  b: { slot: 1, pose: [63, 61, 55, -1], inset: true },
  c: { slot: 2, pose: [48.7, 51, 89, -3.5] },
  c2: { slot: 2, pose: [49, 50.6, 90, -6] },
  d: { slot: 3, pose: [32, 35, 50, -5], inset: true, clip: true },
  e: { slot: 4, pose: [49, 49.5, 88, 1] },
  f: { slot: 5, pose: [58, 57, 52, 8.3], inset: true },
  g: { slot: 6, pose: [52, 50.5, 89, 3] },
  h: { slot: 7, pose: [54, 53.5, 88, 0] },
  i: { slot: 8, pose: [51.5, 53.5, 88, 0.3] },
  // j and k are shuffled around on top of i: each pose is a separate sheet.
  j1: { slot: 9, pose: [42.7, 43.5, 54, -4], inset: true },
  j2: { slot: 9, pose: [46, 47, 54, -9], inset: true },
  j3: { slot: 9, pose: [49, 48, 54, -1], inset: true },
  k1: { slot: 10, pose: [63.6, 60.6, 54, 6], inset: true },
  k2: { slot: 10, pose: [64, 64, 54, 17], inset: true },
  k3: { slot: 10, pose: [60, 59, 54, 6], inset: true },
  k4: { slot: 10, pose: [54, 54.6, 54, 7], inset: true },
  k5: { slot: 10, pose: [52.8, 54.3, 52, -4], inset: true },
  l: { slot: 11, pose: [52, 47, 89, 1] },
  // A one-frame flash in the video.
  m: { slot: 5, pose: [53, 48, 88, 0.5] },
  n: { slot: 12, pose: [52.6, 48, 88, 1] },
  o: { slot: 13, pose: [49, 49.5, 88, -0.5] },
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

/** Shown, without motion, under prefers-reduced-motion: the fullest pile of the first pass. */
const STILL = 8;

const SHEET_IDS = Object.keys(SHEETS) as SheetId[];
const OPENING: SheetId[] = [...PILE, ...STATES[0].top];

interface Position {
  pass: number;
  step: number;
  fading: boolean;
}

function next(at: Position, passes: number): Position {
  if (at.fading) return { pass: 0, step: 0, fading: false };
  if (at.step < STATES.length - 1) return { ...at, step: at.step + 1 };
  if (at.pass < passes - 1) return { pass: at.pass + 1, step: 0, fading: false };
  return { ...at, fading: true };
}

// A pass short of 14 items borrows the rest from the first pass, which is the longest ago.
function itemAt(items: CollageItem[], pass: number, slot: number) {
  const i = pass * SLOTS + slot;
  return items[i < items.length ? i : slot % items.length];
}

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

// A full-size print is 88% of the collage, 603/1400 of the page from lg up.
const SIZES = "(min-width: 1024px) 38vw, 425px";

const reducedMotion = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotion);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function PrintCollage({
  items,
  label,
  eager = false,
  className = "",
}: {
  items: CollageItem[];
  label: string;
  /** Load the opening pile at once, for a collage above the fold. */
  eager?: boolean;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const passes = Math.ceil(items.length / SLOTS);
  const [at, advance] = useReducer(next, { pass: 0, step: 0, fading: false });
  const [onScreen, setOnScreen] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const still = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotion).matches,
    () => false,
  );

  // Only the first pass is waited for: each later one loads while the one before it plays.
  const ready = loaded >= SHEET_IDS.length || timedOut;
  const running = onScreen && ready && !still;

  const shown: Position = still ? { pass: 0, step: STILL, fading: false } : at;
  const stack = [...PILE, ...STATES[shown.step].top];
  const top = itemAt(items, shown.pass, SHEETS[stack[stack.length - 1]].slot);
  // A video on top holds the pile until it has played through.
  const waitForVideo = Boolean(top.video) && !shown.fading;

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
    if (!running || waitForVideo) return;
    // A paused hold starts over when the collage comes back into view.
    const timer = setTimeout(
      () => advance(passes),
      at.fading ? FADE_MS : STATES[at.step].hold * FRAME_MS,
    );
    return () => clearTimeout(timer);
  }, [running, waitForVideo, at, passes]);

  const countLoad = () => setLoaded((n) => n + 1);

  // The pass on show, plus the next one mounted out of sight so its photos are loaded
  // before the cut to it.
  const upcoming = (shown.pass + 1) % passes;
  const mounted = upcoming === shown.pass ? [shown.pass] : [shown.pass, upcoming];

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
          opacity: shown.fading ? 0 : 1,
          transitionDuration: `${FADE_MS}ms`,
        }}
      >
        {mounted.flatMap((pass) =>
          SHEET_IDS.map((id) => {
            const sheet: Sheet = SHEETS[id];
            const item = itemAt(items, pass, sheet.slot);
            const layer = pass === shown.pass ? stack.indexOf(id) : -1;
            const [x, y, width, rotate] = sheet.pose;
            const onLoad = pass === 0 ? countLoad : undefined;
            return (
              <div
                key={`${pass}:${id}`}
                className="@container absolute"
                style={{
                  ...sheetStyle,
                  left: `${x}%`,
                  top: `${y}%`,
                  // A landscape inset is widened to keep about the same area.
                  width: `${item.landscape && sheet.inset ? Math.min(width * 1.25, 80) : width}%`,
                  aspectRatio: item.landscape ? "4 / 3" : "3 / 4",
                  transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
                  zIndex: layer + 1,
                  // Hidden rather than unmounted, so every photo is loaded before it's cut to.
                  opacity: layer < 0 ? 0 : 1,
                }}
              >
                <div
                  className={`absolute overflow-hidden ${sheet.inset ? "inset-[3.4cqw]" : "inset-[1.6cqw]"}`}
                >
                  {item.video ? (
                    <VideoPrint
                      src={item.video}
                      poster={item.src}
                      playing={layer === stack.length - 1 && !shown.fading}
                      running={running}
                      onLoad={onLoad}
                      onEnded={() => advance(passes)}
                    />
                  ) : (
                    <Image
                      src={item.src}
                      alt=""
                      fill
                      sizes={SIZES}
                      loading={
                        eager && pass === 0 && OPENING.includes(id)
                          ? "eager"
                          : "lazy"
                      }
                      onLoad={onLoad}
                      className="object-cover"
                    />
                  )}
                  <span aria-hidden className="absolute inset-0" style={sheenStyle} />
                </div>
                {sheet.clip && <PaperClip />}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}

// A video print: plays from the start when it lands on top of the pile, pauses with the
// collage, and rewinds once covered or lifted off. If the browser refuses to play it, the
// poster holds for as long as the video would have run.
function VideoPrint({
  src,
  poster,
  playing,
  running,
  onLoad,
  onEnded,
}: {
  src: string;
  poster: string;
  playing: boolean;
  running: boolean;
  onLoad?: () => void;
  onEnded: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (!playing) {
      video.pause();
      video.currentTime = 0;
      return;
    }
    if (!running) {
      video.pause();
      return;
    }
    if (video.ended) return;
    let cancelled = false;
    let fallback: ReturnType<typeof setTimeout> | undefined;
    video.muted = true;
    video.play().catch(() => {
      if (cancelled) return;
      const left = (video.duration || 0) - video.currentTime;
      fallback = setTimeout(onEnded, Number.isFinite(left) ? left * 1000 : 0);
    });
    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, [playing, running, onEnded]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      playsInline
      preload="auto"
      onLoadedData={onLoad}
      onEnded={playing ? onEnded : undefined}
      className="absolute inset-0 size-full object-cover"
    />
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
