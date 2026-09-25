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

// A stop-motion pile of photo prints, after the designer's "Archive Collage.mp4", thrown on
// the page as if by an old film projector. Prints are laid on the pile one at a time, full
// size or as a smaller tilted print, shuffled, and lifted back off. Each move is animated on
// twos: the print holds each of a few poses for a frame, spaced like a hand easing it into
// place, then cuts to where it lands. The choreography lays down 14 prints; a longer set
// runs it again with the next 14 (a pass), the first print of each pass laid straight onto
// the last pass's pile. A last pass of fewer than 14 plays only the states its items fill.
// After the last pass the loop starts over through a reel change: the film slips in the
// gate, the lamp flares, and the opening pile is simply there.

/** One frame of the stop motion: 12fps, on twos against the projector's 24. */
const FRAME_MS = 1000 / 12;
/** One frame of the projector: its shake, flicker, grain, scratches and dust. */
const PROJECTOR_MS = 1000 / 24;
/** Stop-motion frames of the reel change between two runs of the loop. */
const REEL_FRAMES = 8;
/** Start anyway if some photo never reports loaded. */
const READY_TIMEOUT_MS = 4000;
/** The distinct prints in one pass of the choreography. */
const SLOTS = 14;

// Each move, as how far along its way the print is in each frame it holds; after the last
// one it cuts to where it lands. A print is laid down from, and lifted off to, AWAY.
/** Laid down: in fast, then settling. */
const LAY = [0, 0.5, 0.8, 0.95];
/** Lifted off: slow to start, and gone once clear of the pile. */
const LIFT = [0.12, 0.38, 0.72];
/** Nudged across the pile. */
const NUDGE = [0.2, 0.6, 0.9];
/** How far off its pose a print is laid down from, in % of the collage. */
const AWAY = 10;

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
  /** The sheet it is a later pose of: the same print, nudged there. */
  of?: string;
}

const SHEETS = {
  // The pile the video starts on: only its edges ever show.
  base1: { slot: 8, pose: [51, 50.5, 88, 0.6] },
  base2: { slot: 6, pose: [50, 51.5, 88, -0.9] },
  base3: { slot: 2, pose: [51.5, 50.8, 88, 1.5] },
  a: { slot: 0, pose: [52, 47, 88, 0] },
  b: { slot: 1, pose: [63, 61, 55, -1], inset: true },
  c: { slot: 2, pose: [48.7, 51, 89, -3.5] },
  c2: { slot: 2, pose: [49, 50.6, 90, -6], of: "c" },
  d: { slot: 3, pose: [32, 35, 50, -5], inset: true, clip: true },
  e: { slot: 4, pose: [49, 49.5, 88, 1] },
  f: { slot: 5, pose: [58, 57, 52, 8.3], inset: true },
  g: { slot: 6, pose: [52, 50.5, 89, 3] },
  h: { slot: 7, pose: [54, 53.5, 88, 0] },
  i: { slot: 8, pose: [51.5, 53.5, 88, 0.3] },
  // j and k are shuffled around on top of i.
  j1: { slot: 9, pose: [42.7, 43.5, 54, -4], inset: true },
  j2: { slot: 9, pose: [46, 47, 54, -9], inset: true, of: "j1" },
  j3: { slot: 9, pose: [49, 48, 54, -1], inset: true, of: "j1" },
  k1: { slot: 10, pose: [63.6, 60.6, 54, 6], inset: true },
  k2: { slot: 10, pose: [64, 64, 54, 17], inset: true, of: "k1" },
  k3: { slot: 10, pose: [54, 54.6, 54, 7], inset: true, of: "k1" },
  k4: { slot: 10, pose: [52.8, 54.3, 52, -4], inset: true, of: "k1" },
  l: { slot: 11, pose: [52, 47, 89, 1] },
  n: { slot: 12, pose: [52.6, 48, 88, 1] },
  o: { slot: 13, pose: [49, 49.5, 88, -0.5] },
} satisfies Record<string, Sheet>;

type SheetId = keyof typeof SHEETS;

const PILE: SheetId[] = ["base1", "base2", "base3"];

// The video's second (complete) play, frames 178–338, loosened: its one- and two-frame
// flashes are gone, and prints it cut on or off together are mostly taken one at a time.
// Each state holds for `hold` stop-motion frames, its moves included, with the prints on the
// pile bottom to top.
interface State {
  hold: number;
  top: SheetId[];
}

const STATES: State[] = [
  { hold: 14, top: ["a"] },
  { hold: 12, top: ["a", "b"] },
  { hold: 13, top: ["a", "b", "c"] },
  { hold: 14, top: ["a", "b", "c", "d"] },
  { hold: 11, top: ["a", "b", "c", "d", "e"] },
  { hold: 12, top: ["a", "b", "c", "d", "e", "f"] },
  { hold: 11, top: ["a", "b", "c", "d", "e", "f", "g"] },
  { hold: 11, top: ["a", "b", "c", "d", "e", "f", "g", "h"] },
  { hold: 14, top: ["a", "b", "c", "d", "e", "f", "g", "h", "i"] },
  { hold: 13, top: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "k1", "j1"] },
  { hold: 10, top: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j2", "k2"] },
  { hold: 10, top: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j3", "k3"] },
  { hold: 11, top: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "k4"] },
  { hold: 12, top: ["a", "b", "c", "d", "e", "f", "g", "h", "i"] },
  { hold: 11, top: ["a", "b", "c", "d", "e", "f", "g", "h"] },
  { hold: 12, top: ["a", "b", "c", "d", "e", "f"] },
  { hold: 11, top: ["a", "b", "c", "d", "e"] },
  { hold: 10, top: ["a", "b", "c"] },
  { hold: 11, top: ["a", "b", "c2"] },
  { hold: 13, top: ["a", "b", "c2", "l"] },
  { hold: 12, top: ["a", "b"] },
  { hold: 11, top: ["a"] },
  { hold: 13, top: ["a", "n"] },
  { hold: 22, top: ["a", "n", "o"] },
];

const SHEET_IDS = Object.keys(SHEETS) as SheetId[];

/** The print a sheet is a pose of, named after its first sheet. */
const printOf = (id: SheetId): string => (SHEETS[id] as Sheet).of ?? id;
const PRINTS = [...new Set(SHEET_IDS.map(printOf))];
const OPENING = [...PILE, ...STATES[0].top];

interface Position {
  pass: number;
  step: number;
  /** A beat before the step's own hold: the last pass's pile, kept under the first print of
   *  this one until it lands (`carry`), or the reel change as the loop starts over. */
  lead?: "carry" | "reel";
}

function next(at: Position, scripts: State[][]): Position {
  if (at.lead) return { pass: at.pass, step: at.step };
  if (at.step < scripts[at.pass].length - 1) return { pass: at.pass, step: at.step + 1 };
  if (at.pass < scripts.length - 1) return { pass: at.pass + 1, step: 0, lead: "carry" };
  return { pass: 0, step: 0, lead: "reel" };
}

// The part of the choreography that `count` items fill: the states whose prints all have an
// item, with a state that repeats the one before it merged into it.
function scriptFor(count: number): State[] {
  const script: State[] = [];
  for (const state of STATES) {
    if (state.top.some((id) => SHEETS[id].slot >= count)) continue;
    const last = script[script.length - 1];
    if (last && last.top.join() === state.top.join()) last.hold += state.hold;
    else script.push({ ...state });
  }
  return script;
}

// One script per pass for a set of `total` items, cached so a collage gets the same arrays
// on every render.
const scriptCache = new Map<number, State[][]>();
function scriptsFor(total: number) {
  let scripts = scriptCache.get(total);
  if (!scripts) {
    scripts = Array.from({ length: Math.ceil(total / SLOTS) }, (_, pass) =>
      scriptFor(Math.min(SLOTS, total - pass * SLOTS)),
    );
    scriptCache.set(total, scripts);
  }
  return scripts;
}

// The pile's edges in a short pass borrow from the first pass.
function itemAt(items: CollageItem[], pass: number, slot: number) {
  const i = pass * SLOTS + slot;
  return items[i < items.length ? i : slot % items.length];
}

const sheetIn = (stack: SheetId[], print: string) =>
  stack.find((id) => printOf(id) === print);

// The sheet a print is next laid down as, from `step` on, so it waits off the pile where
// that move starts.
function nextSheet(script: State[], step: number, print: string): SheetId {
  for (let s = step; s < script.length; s++) {
    const id = sheetIn(script[s].top, print);
    if (id) return id;
  }
  return SHEET_IDS.find((id) => printOf(id) === print)!;
}

// Where a print comes onto the pile from and goes back off to: pushed out from the middle,
// turned a little further, and raised toward the lens. A print near the middle leaves by
// the golden angle times its slot, so neighbours don't share a direction.
function away({ slot, pose: [x, y, width, rotate] }: Sheet): Pose {
  let dx = x - 50;
  let dy = y - 50;
  const off = Math.hypot(dx, dy);
  if (off < 4) {
    dx = Math.cos(slot * 2.4);
    dy = Math.sin(slot * 2.4);
  } else {
    dx /= off;
    dy /= off;
  }
  return [x + dx * AWAY, y + dy * AWAY, width, rotate + (slot % 2 ? 5 : -5)];
}

// A move as a CSS transition. `linear()` with a flat stretch per frame is a staircase, so
// the print holds each pose and cuts to the next. It shows at the start of a move onto the
// pile, and goes at the end of one off it.
function move(points: number[], opacity: "step-start" | "step-end") {
  const n = points.length;
  const at = (i: number) => `${((100 * i) / n).toFixed(3)}%`;
  const stairs = points.map((p, i) => `${p} ${at(i)}, ${p} ${at(i + 1)}`).join(", ");
  const time = `${Math.round(n * FRAME_MS)}ms`;
  const ease = `linear(${stairs}, 1 100%)`;
  return [
    ...["left", "top", "width", "transform"].map((p) => `${p} ${time} ${ease}`),
    `opacity ${time} ${opacity}`,
  ].join(", ");
}

const LAY_MOVE = move(LAY, "step-start");
const LIFT_MOVE = move(LIFT, "step-end");
const NUDGE_MOVE = move(NUDGE, "step-start");

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

// ---- The projector ---------------------------------------------------------------------

// Mulberry32: seeded, so the server and the browser write the same frames.
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const fixed = (n: number) => n.toFixed(3);
const ms = (frames: number, frame = PROJECTOR_MS) => `${Math.round(frames * frame)}ms`;

// A looping animation of `count` projector frames, each held until the next (it runs with
// steps(1, end)). Its lengths are coprime, so together they rarely repeat.
function keyframes(
  name: string,
  count: number,
  seed: number,
  frame: (i: number, random: () => number) => string,
) {
  const random = seeded(seed);
  let css = `@keyframes ${name} {`;
  for (let i = 0; i < count; i++) css += ` ${fixed((100 * i) / count)}% { ${frame(i, random)} }`;
  return `${css} }`;
}

// The projector's shake, in cqw: a slow weave of the film in the gate, a jitter every frame,
// and a small hop each turn of the claw.
const WEAVE = keyframes("pc-weave", 48, 11, (i, random) => {
  const turn = (2 * Math.PI * i) / 48;
  const x = 0.16 * Math.sin(2 * turn) + (random() - 0.5) * 0.14;
  const y = 0.2 * Math.sin(3 * turn + 1) + (random() - 0.5) * 0.2 + (i % 12 === 0 ? 0.35 : 0);
  const tilt = (random() - 0.5) * 0.08;
  return `transform: translate(${fixed(x)}cqw, ${fixed(y)}cqw) rotate(${fixed(tilt)}deg)`;
});

// The lamp: a steady flicker, now and then a brighter frame or a dim one.
const LAMP = keyframes("pc-lamp", 47, 23, (_, random) => {
  const r = random();
  const opacity = r < 0.06 ? 0.26 : r > 0.95 ? 0.02 : 0.09 + random() * 0.06;
  return `opacity: ${fixed(opacity)}`;
});

const FALLOFF = keyframes("pc-falloff", 37, 31, (_, random) => {
  return `opacity: ${fixed(0.84 + random() * 0.16)}`;
});

// The grain is a tile of noise, jumped to a new place every frame.
const GRAIN_JUMP = keyframes("pc-grain", 9, 41, (_, random) => {
  const x = (random() - 0.5) * 40;
  const y = (random() - 0.5) * 40;
  return `transform: translate(${fixed(x)}%, ${fixed(y)}%)`;
});

// A scratch runs down the film for a few frames at a time, drifting a little, twice a loop.
function scratch(name: string, count: number, seed: number) {
  const random = seeded(seed);
  const runs = [0, 1].map((half) => ({
    start: Math.floor(count * (half / 2 + random() * 0.35)),
    length: 3 + Math.floor(random() * 6),
    x: 8 + random() * 84,
  }));
  return keyframes(name, count, seed + 1, (i, jitter) => {
    const run = runs.find(({ start, length }) => i >= start && i < start + length);
    if (!run) return "opacity: 0";
    const x = run.x + (i - run.start) * 0.2 + jitter() * 0.3;
    return `opacity: ${fixed(0.45 + jitter() * 0.55)}; transform: translateX(${fixed(x)}cqw)`;
  });
}

// A fleck of dust on the film, caught for a single frame here and there.
const DUST = keyframes("pc-dust", 61, 53, (_, random) => {
  if (random() > 0.1) return "opacity: 0";
  const x = 4 + random() * 86;
  const y = 4 + random() * 120;
  return `opacity: ${fixed(0.5 + random() * 0.5)}; transform: translate(${fixed(x)}cqw, ${fixed(y)}cqw) rotate(${Math.round(random() * 360)}deg)`;
});

const svg = (body: string, size: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${body}</svg>`,
  )}")`;

// Grey noise, mostly light, so multiplied over the frame it only ever darkens a little.
const GRAIN_TILE = svg(
  "<filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncR type='linear' slope='1.3' intercept='0.25'/><feFuncG type='linear' slope='1.3' intercept='0.25'/><feFuncB type='linear' slope='1.3' intercept='0.25'/><feFuncA type='table' tableValues='1 1'/></feComponentTransfer></filter><rect width='100%' height='100%' filter='url(#g)'/>",
  220,
);

// A mask: two specks and a hair.
const DUST_SHAPE = svg(
  "<circle cx='9' cy='11' r='1.4'/><circle cx='29' cy='27' r='0.8'/><path d='M12 31c4-3 7-9 12-8s7-5 9-7' fill='none' stroke='black' stroke-width='0.6'/>",
  40,
);

// The projector's gate: the frame's edges go soft rather than stop.
const GATE =
  "linear-gradient(to right, transparent, black 6%, black 94%, transparent), linear-gradient(transparent, black 4.5%, black 95.5%, transparent)";

// Unlayered, and scoped by the pc- prefix. It is a template literal: no backticks in it.
const CSS = `
.pc-weave {
  background: var(--paper);
  animation: pc-weave ${ms(48)} steps(1, end) infinite;
}
.pc-film {
  filter: sepia(0.22) saturate(0.86) contrast(1.05);
}
.pc-gate {
  pointer-events: none;
  -webkit-mask-image: ${GATE};
  mask-image: ${GATE};
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}
.pc-falloff {
  mix-blend-mode: multiply;
  background: radial-gradient(ellipse 78% 72% at 50% 47%, transparent 45%, color-mix(in srgb, var(--ink) 20%, transparent));
  animation: pc-falloff ${ms(37)} steps(1, end) infinite;
}
.pc-lamp {
  background: radial-gradient(ellipse 52% 44% at 50% 46%, color-mix(in srgb, white 80%, var(--paper)), transparent);
  opacity: 0.1;
  animation: pc-lamp ${ms(47)} steps(1, end) infinite;
}
.pc-grain {
  overflow: hidden;
  mix-blend-mode: multiply;
  opacity: 0.22;
}
.pc-grain::before {
  content: "";
  position: absolute;
  inset: -50%;
  background: ${GRAIN_TILE};
  animation: pc-grain ${ms(9)} steps(1, end) infinite;
}
.pc-scratch {
  position: absolute;
  top: 4%;
  bottom: 4%;
  left: 0;
  width: 1px;
  opacity: 0;
  pointer-events: none;
  background: linear-gradient(transparent, color-mix(in srgb, var(--ink) 32%, transparent) 20%, color-mix(in srgb, var(--ink) 22%, transparent) 80%, transparent);
}
.pc-scratch-a { animation: pc-scratch-a ${ms(79)} steps(1, end) infinite; }
.pc-scratch-b { animation: pc-scratch-b ${ms(113)} steps(1, end) infinite; }
.pc-dust {
  position: absolute;
  left: 0;
  top: 0;
  width: 6cqw;
  aspect-ratio: 1;
  opacity: 0;
  pointer-events: none;
  background: color-mix(in srgb, var(--ink) 60%, transparent);
  -webkit-mask: ${DUST_SHAPE} center / contain no-repeat;
  mask: ${DUST_SHAPE} center / contain no-repeat;
  animation: pc-dust ${ms(61)} steps(1, end) infinite;
}
.pc-flash {
  background: color-mix(in srgb, white 45%, var(--paper));
  opacity: 0;
}
.pc[data-reel] .pc-film { animation: pc-slip ${ms(REEL_FRAMES, FRAME_MS)} steps(1, end); }
.pc[data-reel] .pc-flash { animation: pc-flare ${ms(REEL_FRAMES, FRAME_MS)} steps(1, end); }
.pc:not([data-running]) *,
.pc:not([data-running]) .pc-grain::before {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .pc *,
  .pc .pc-grain::before {
    animation: none !important;
  }
}
${WEAVE}
${LAMP}
${FALLOFF}
${GRAIN_JUMP}
${scratch("pc-scratch-a", 79, 61)}
${scratch("pc-scratch-b", 113, 71)}
${DUST}
@keyframes pc-slip {
  0% { transform: translateY(-7%); }
  12.5% { transform: translateY(10%); }
  25% { transform: translateY(-3.5%); }
  37.5% { transform: translateY(2%); }
  50% { transform: translateY(-0.8%); }
  62.5% { transform: translateY(0.3%); }
  75% { transform: none; }
}
@keyframes pc-flare {
  0% { opacity: 0.92; }
  12.5% { opacity: 0.5; }
  25% { opacity: 0.72; }
  37.5% { opacity: 0.3; }
  50% { opacity: 0.16; }
  62.5% { opacity: 0.06; }
  75% { opacity: 0; }
}
`;

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
  const scripts = scriptsFor(items.length);
  const passes = scripts.length;
  // The prints a pass can show: its pile, and every print it has an item for.
  const printsOf = (pass: number) =>
    PRINTS.filter(
      (print) =>
        PILE.includes(print as SheetId) ||
        pass * SLOTS + SHEETS[print as SheetId].slot < items.length,
    );
  // Shown, without motion, under prefers-reduced-motion: the first pass's fullest pile.
  const fullest = scripts[0].reduce(
    (best, state, i) => (state.top.length > scripts[0][best].top.length ? i : best),
    0,
  );
  const [at, advance] = useReducer(next, { pass: 0, step: 0 });
  const [onScreen, setOnScreen] = useState(false);
  const [loaded, setLoaded] = useState(0);
  const [timedOut, setTimedOut] = useState(false);
  const still = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotion).matches,
    () => false,
  );

  // Only the first pass is waited for: each later one loads while the one before it plays.
  const ready = loaded >= printsOf(0).length || timedOut;
  const running = onScreen && ready && !still;

  const shown: Position = still ? { pass: 0, step: fullest } : at;
  const script = scripts[shown.pass];
  const { top: onTop } = script[shown.step];
  // While carried, the last pass's whole pile stays under this one's first print; its own
  // pile goes down as the old one is cleared away.
  const carried = shown.lead === "carry" ? shown.pass - 1 : -1;
  const stack = carried < 0 ? [...PILE, ...onTop] : onTop;
  const carriedStack = carried < 0 ? [] : [...PILE, ...scripts[carried].at(-1)!.top];
  const before = shown.step > 0 ? script[shown.step - 1].top : [];
  const topSheet = stack[stack.length - 1];
  const top = itemAt(items, shown.pass, SHEETS[topSheet].slot);
  // A video on top holds the pile until it has played through.
  const waitForVideo = Boolean(top.video) && !shown.lead;

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
    const frames =
      at.lead === "carry"
        ? LAY.length
        : at.lead === "reel"
          ? REEL_FRAMES
          : scripts[at.pass][at.step].hold;
    // A paused hold starts over when the collage comes back into view.
    const timer = setTimeout(() => advance(scripts), frames * FRAME_MS);
    return () => clearTimeout(timer);
  }, [running, waitForVideo, at, scripts]);

  const countLoad = () => setLoaded((n) => n + 1);

  // The pass on show, the last one while it's carried, and the next one mounted out of
  // sight so its photos are loaded before it's cut to.
  const mounted = [
    ...new Set([carried, shown.pass, (shown.pass + 1) % passes].filter((p) => p >= 0)),
  ];

  return (
    <>
      {/* React 19 hoists this into <head> and dedupes it across instances. */}
      <style href="print-collage" precedence="default">
        {CSS}
      </style>
      <div
        ref={root}
        role="img"
        aria-label={label}
        data-running={running || undefined}
        data-reel={shown.lead === "reel" || undefined}
        className={`pc @container relative [--pc-print:color-mix(in_srgb,white_72%,var(--paper))] ${className}`}
      >
        <div className="pc-weave absolute inset-0">
          <div className="pc-film absolute inset-0">
            {mounted.flatMap((pass) =>
              printsOf(pass).map((print) => {
                const live = pass === shown.pass;
                const onPile = live ? stack : pass === carried ? carriedStack : [];
                const id = sheetIn(onPile, print);
                const was = live ? sheetIn(before, print) : undefined;
                const sheet: Sheet =
                  SHEETS[id ?? was ?? nextSheet(scripts[pass], live ? shown.step : 0, print)];
                const item = itemAt(items, pass, sheet.slot);
                const [x, y, width, rotate] = id ? sheet.pose : away(sheet);
                // The pile sits a layer above a carried one; a print being lifted off keeps
                // its place in the pile until it's gone.
                const layer = id
                  ? onPile.indexOf(id) + (live ? 40 : 1)
                  : was
                    ? PILE.length + before.indexOf(was) + 40
                    : 0;
                // The pile under the prints, a carried pass, and the reel change all cut.
                const moving = live && shown.lead !== "reel" && !PILE.includes(print as SheetId);
                const transition = !moving
                  ? "none"
                  : id
                    ? was
                      ? NUDGE_MOVE
                      : LAY_MOVE
                    : was
                      ? LIFT_MOVE
                      : "none";
                const onLoad = pass === 0 ? countLoad : undefined;
                return (
                  <div
                    key={`${pass}:${print}`}
                    className="@container absolute"
                    style={{
                      ...sheetStyle,
                      left: `${x}%`,
                      top: `${y}%`,
                      // A landscape inset is widened to keep about the same area.
                      width: `${item.landscape && sheet.inset ? Math.min(width * 1.25, 80) : width}%`,
                      aspectRatio: item.landscape ? "4 / 3" : "3 / 4",
                      transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${id ? 1 : 1.06})`,
                      zIndex: layer,
                      // Hidden rather than unmounted, so every photo is loaded before it's cut to.
                      opacity: id ? 1 : 0,
                      transition,
                    }}
                  >
                    <div
                      className={`absolute overflow-hidden ${sheet.inset ? "inset-[3.4cqw]" : "inset-[1.6cqw]"}`}
                    >
                      {item.video ? (
                        <VideoPrint
                          src={item.video}
                          poster={item.src}
                          playing={live && id === topSheet && !shown.lead}
                          held={pass === carried && Boolean(id)}
                          running={running}
                          onLoad={onLoad}
                          onEnded={() => advance(scripts)}
                        />
                      ) : (
                        <Image
                          src={item.src}
                          alt=""
                          fill
                          sizes={SIZES}
                          loading={
                            eager && pass === 0 && OPENING.includes(print as SheetId)
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
          <div aria-hidden className="pc-gate pc-grain absolute inset-0" />
          <div aria-hidden className="pc-gate pc-falloff absolute inset-0" />
          <div aria-hidden className="pc-gate pc-lamp absolute inset-0" />
          <span aria-hidden className="pc-scratch pc-scratch-a" />
          <span aria-hidden className="pc-scratch pc-scratch-b" />
          <span aria-hidden className="pc-dust" />
          <div aria-hidden className="pc-gate pc-flash absolute inset-0" />
        </div>
      </div>
    </>
  );
}

// A video print: plays from the start when it lands on top of the pile, pauses with the
// collage, and rewinds once covered or lifted off (but not while `held` under the next
// pass's first print). If the browser refuses to play it, the poster holds for as long as
// the video would have run.
function VideoPrint({
  src,
  poster,
  playing,
  held,
  running,
  onLoad,
  onEnded,
}: {
  src: string;
  poster: string;
  playing: boolean;
  held: boolean;
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
      if (!held) video.currentTime = 0;
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
  }, [playing, held, running, onEnded]);

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
