"use client";

import React from "react";

export interface WorkFolderImage {
  src: string;
  /** Empty by default: the cards duplicate the folder title, so they are decorative. */
  alt?: string;
  /** width / height. Drives how far the card travels, since it hides behind the folder by exactly its own height. */
  aspectRatio?: number;
  /** Degrees. Overrides the angle this card would get from the fan. */
  rotate?: number;
  /** Multiples of `photoGap`. Nudges the card off the even spacing. */
  offsetX?: number;
  /** px of extra lift once the card is out. Use to break a too-regular fan. */
  offsetY?: number;
}

/** px when a number; any CSS length otherwise, e.g. "calc(120 * var(--u))". */
export type WorkFolderLength = number | string;

export interface WorkFolderItem {
  title: string;
  /** The "files" inside this folder. Any length, including none. */
  images?: WorkFolderImage[];
  /** Panel fill. Falls back to `palette[index % palette.length]`. */
  color?: string;
  /** Text colour on the panel. Falls back to black. */
  ink?: string;
  /** Defaults to the zero-padded position: "01", "02", … */
  label?: string;
  /** Renders the panel as a link, which also makes the reveal keyboard-reachable. */
  href?: string;
  /** Flex ratio within its row, in columns. 1 = one column, 2 = a full default row. */
  span?: number;
}

/**
 * An inert folder the colour of the page. It holds nothing and never reacts; it exists
 * so the folder above gets the next row's tab cut into its bottom edge, and so the rest
 * of its row starts further in. Dropped on narrow screens, where every folder gets a row.
 */
export interface WorkFolderBlank {
  blank: true;
  span?: number;
  /** Defaults to `--paper`. */
  color?: string;
}

export interface WorkFolderProps {
  items: (WorkFolderItem | WorkFolderBlank)[];
  /** Folders per row at full width. */
  columns?: number;
  /** Show the "01", "02", … line above each title. */
  labels?: boolean;
  /** Vertical pitch between folders. Panels are taller than this, so they overlap. */
  rowHeight?: WorkFolderLength;
  panelHeight?: WorkFolderLength;
  /** Width of the raised tab on the folder's top-left. */
  tabWidth?: WorkFolderLength;
  photoWidth?: WorkFolderLength;
  /** Centre-to-centre spacing of the cards. Below `photoWidth` they overlap. */
  photoGap?: WorkFolderLength;
  /** The fan spans -maxTilt … +maxTilt degrees, left to right. */
  maxTilt?: number;
  /** How far the hovered folder rises. */
  lift?: WorkFolderLength;
  /**
   * Fill the other folders repaint to. It is an opaque colour rather than a reduced
   * opacity: the folders overlap, and a translucent one would tint the folder beneath
   * instead of hiding it.
   */
  dimColor?: string;
  /** Text colour that goes with `dimColor`. */
  dimInk?: string;
  /** ms. */
  duration?: number;
  /** Horizontal space between folders in a row. The reference butts them together. */
  gap?: WorkFolderLength;
  palette?: string[];
  className?: string;
  style?: React.CSSProperties;
}

// Sampled off the reference recording: yellow, two light greys, one mid grey. Cycling
// at length 4 is what puts yellow back under the fifth folder.
const PALETTE = ["#FBE12D", "#D6D7D4", "#D6D7D4", "#A7ABA7"];

// The tab's rise, and also the run of its 45° chamfer.
const TAB_RISE = 24;

const CSS = `
.wf {
  --wf-tab-rise: ${TAB_RISE}px;
  --wf-pad: 25px;
  --wf-pad-top: 14px;
  --wf-ink: #000;
  --wf-ease: cubic-bezier(0.33, 1, 0.68, 1);
  --wf-title-size: 50px;
  --wf-label-size: 13px;
  /* Defaults to the site type system; override per instance only to break from it. */
  --wf-font-title: var(--font-times);
  --wf-font-label: var(--font-sans);
  --wf-blank-color: var(--paper);
  /* Clamped so a folder narrower than the tab cannot have its notch overrun its own edge. */
  --wf-tab: min(var(--wf-tab-w), 100% - 2 * var(--wf-tab-rise));

  display: flex;
  flex-wrap: wrap;
  column-gap: var(--wf-gap);
  row-gap: 0;
  list-style: none;
  margin: 0;
  padding: 0 0 calc(var(--wf-panel-h) - var(--wf-row));
  /* Keeps the component's internal layering from competing with the host page. */
  isolation: isolate;
}

.wf-item {
  position: relative;
  height: var(--wf-row);
  min-width: 0;
  flex: 0 0 calc(var(--wf-frac) * (100% + var(--wf-gap)) - var(--wf-gap));
  /* Deliberately no z-index, opacity or transform here. Any of them would open a
     stacking context and trap .wf-photos below the other folders' panels. */
}

.wf-panel,
.wf-blank::before {
  position: absolute;
  inset: 0 0 auto 0;
  height: var(--wf-panel-h);
  z-index: 1;
  display: block;
  box-sizing: border-box;
  padding: var(--wf-pad-top) var(--wf-pad) 0;
  border: 0;
  margin: 0;
  background-color: var(--wf-color);
  color: var(--wf-ink);
  text-align: left;
  text-decoration: none;
  font: inherit;
  /* Tab on the left, then a 45° chamfer down to the body. Also clips the hit area,
     so the notch beside the tab correctly belongs to whatever is behind it. */
  clip-path: polygon(
    0 0,
    var(--wf-tab) 0,
    calc(var(--wf-tab) + var(--wf-tab-rise)) var(--wf-tab-rise),
    100% var(--wf-tab-rise),
    100% 100%,
    0 100%
  );
  transition:
    background-color var(--wf-dur) var(--wf-ease),
    color var(--wf-dur) var(--wf-ease),
    transform var(--wf-dur) var(--wf-ease);
}

a.wf-panel { cursor: pointer; }

.wf-blank::before { content: ""; }

.wf-label {
  display: block;
  font-family: var(--wf-font-label);
  font-size: var(--wf-label-size);
  line-height: 1;
  /* Matches the site-wide "label" utility in globals.css. */
  letter-spacing: 0.22em;
}

.wf-title {
  display: block;
  font-family: var(--wf-font-title);
  font-size: var(--wf-title-size);
  font-style: italic;
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.wf-label + .wf-title { margin-top: 12px; }

.wf-photos {
  position: absolute;
  left: 0;
  right: 0;
  /* Bottom edge sits on the folder's body top, so a card parked at its hidden
     offset is entirely outside this box. */
  bottom: calc(100% - var(--wf-tab-rise));
  height: calc(var(--wf-photo-w) * 2.2);
  z-index: 2;
  pointer-events: none;
  /* The exact inverse of the panel's silhouette: cards are cut off along the tab
     step rather than a straight line, and none can leak out beside the tab. */
  clip-path: polygon(
    0 0,
    100% 0,
    100% 100%,
    calc(var(--wf-tab) + var(--wf-tab-rise)) 100%,
    var(--wf-tab) calc(100% - var(--wf-tab-rise)),
    0 calc(100% - var(--wf-tab-rise))
  );
  transition: transform var(--wf-dur) var(--wf-ease);
}

.wf-card {
  position: absolute;
  left: 50%;
  bottom: 0;
  width: var(--wf-photo-w);
  height: auto;
  aspect-ratio: var(--wf-ar);
  object-fit: cover;
  /* Fan out around the base of each card, so their bottom edges stay on one line. */
  transform-origin: 50% 100%;
  transform:
    translateX(calc(-50% + var(--wf-photo-gap) * var(--wf-x)))
    translateY(calc(var(--wf-photo-w) * var(--wf-hidden)))
    rotate(var(--wf-r));
  transition: transform var(--wf-dur) var(--wf-ease);
}

/* Engaging any folder repaints all of them … */
.wf:has(.wf-panel:hover) .wf-panel,
.wf:has(.wf-panel:focus-visible) .wf-panel {
  background-color: var(--wf-dim-bg);
  color: var(--wf-dim-ink);
}

/* … except the engaged one, which keeps its colour and rises. */
.wf:has(.wf-panel:hover) .wf-panel:hover,
.wf:has(.wf-panel:focus-visible) .wf-panel:focus-visible {
  background-color: var(--wf-color);
  color: var(--wf-ink);
  transform: translateY(calc(-1 * var(--wf-lift)));
}

.wf-panel:hover ~ .wf-photos,
.wf-panel:focus-visible ~ .wf-photos {
  transform: translateY(calc(-1 * var(--wf-lift)));
}

.wf-panel:hover ~ .wf-photos .wf-card,
.wf-panel:focus-visible ~ .wf-photos .wf-card {
  transform:
    translateX(calc(-50% + var(--wf-photo-gap) * var(--wf-x)))
    translateY(calc(-1 * var(--wf-oy)))
    rotate(var(--wf-r));
}

.wf-panel:focus-visible {
  outline: 2px solid var(--wf-ink);
  outline-offset: -6px;
}

@media (max-width: 700px) {
  /* Important because the props and the style prop arrive as inline styles, which would
     otherwise beat this block. */
  .wf {
    --wf-row: 68px !important;
    --wf-panel-h: 108px !important;
    --wf-tab-w: 150px !important;
    --wf-tab-rise: 18px !important;
    --wf-pad: 18px !important;
    --wf-pad-top: 10px !important;
    --wf-title-size: 34px !important;
    --wf-photo-w: 108px !important;
    --wf-photo-gap: 95px !important;
  }
  .wf-label + .wf-title { margin-top: 8px; }
  /* One folder per row: spans stop meaning anything once there is only one column. */
  .wf-item { flex-basis: 100%; }
  .wf-blank { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .wf-panel,
  .wf-photos,
  .wf-card {
    transition-duration: 0.01ms;
  }
}
`;

/**
 * How far below the fold a card must sit for its rotated corners to stay hidden, as a
 * multiple of the card width, so it holds at any card size.
 */
function hiddenOffset(aspectRatio: number, deg: number) {
  const height = 1 / aspectRatio;
  const rad = (Math.abs(deg) * Math.PI) / 180;
  // Rotating about the bottom edge lifts the far top corner by (w/2)·sinθ while the
  // near one drops by h·(1 − cosθ); the card has to clear the difference.
  const bleed = Math.max(0, Math.sin(rad) / 2 - height * (1 - Math.cos(rad)));
  return height + bleed;
}

const length = (value: WorkFolderLength) =>
  typeof value === "number" ? `${value}px` : value;

/**
 * A stack of overlapping file folders. Hovering one dims the rest and fans that
 * folder's images up from behind its top edge.
 *
 * Everything the interaction needs lives in CSS, so pointing at a folder never
 * re-renders React.
 */
export const WorkFolder: React.FC<WorkFolderProps> = ({
  items,
  columns = 2,
  labels = true,
  rowHeight = 96,
  panelHeight = 152,
  tabWidth = 266,
  photoWidth = 155,
  photoGap = 137,
  maxTilt = 11,
  lift = 12,
  dimColor = "#F3F3F3",
  dimInk = "#CACACA",
  duration = 220,
  gap = 0,
  palette = PALETTE,
  className = "",
  style,
}) => {
  const rootVars = {
    "--wf-row": length(rowHeight),
    "--wf-panel-h": length(panelHeight),
    "--wf-tab-w": length(tabWidth),
    "--wf-photo-w": length(photoWidth),
    "--wf-photo-gap": length(photoGap),
    "--wf-gap": length(gap),
    "--wf-lift": length(lift),
    "--wf-dim-bg": dimColor,
    "--wf-dim-ink": dimInk,
    "--wf-dur": `${duration}ms`,
    ...style,
  } as React.CSSProperties;

  return (
    <>
      {/* React 19 hoists this into <head> and dedupes it across instances. */}
      <style href="work-folder" precedence="default">
        {CSS}
      </style>
      <ul className={`wf ${className}`.trim()} style={rootVars}>
        {items.map((item, i) => {
          const frac = `${(item.span ?? 1) / columns}`;

          if ("blank" in item) {
            return (
              <li
                key={`blank-${i}`}
                className="wf-item wf-blank"
                aria-hidden="true"
                style={
                  {
                    "--wf-frac": frac,
                    "--wf-color": item.color ?? "var(--wf-blank-color)",
                  } as React.CSSProperties
                }
              />
            );
          }

          // Blanks are not folders, so they take neither a number nor a palette slot.
          const n = items.slice(0, i).filter((other) => !("blank" in other)).length;
          const images = item.images ?? [];
          const Panel = item.href ? "a" : "div";

          return (
            <li
              key={`${item.title}-${i}`}
              className="wf-item"
              style={{ "--wf-frac": frac } as React.CSSProperties}
            >
              <Panel
                className="wf-panel"
                href={item.href}
                style={
                  {
                    "--wf-color": item.color ?? palette[n % palette.length],
                    ...(item.ink && { "--wf-ink": item.ink }),
                  } as React.CSSProperties
                }
              >
                {labels && (
                  <span className="wf-label">
                    {item.label ?? String(n + 1).padStart(2, "0")}
                  </span>
                )}
                <span className="wf-title">{item.title}</span>
              </Panel>

              <div className="wf-photos">
                {images.map((image, j) => {
                  const aspectRatio = image.aspectRatio ?? 4 / 3;
                  // Left card leans furthest anticlockwise, right card furthest clockwise.
                  const rotate =
                    image.rotate ??
                    (images.length < 2
                      ? 0
                      : -maxTilt + (2 * maxTilt * j) / (images.length - 1));
                  const offsetX =
                    image.offsetX ?? j - (images.length - 1) / 2;

                  return (
                    // Sources are arbitrary consumer strings, and next/image refuses
                    // SVG without images.dangerouslyAllowSVG.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={`${image.src}-${j}`}
                      className="wf-card"
                      src={image.src}
                      alt={image.alt ?? ""}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      style={
                        {
                          zIndex: j,
                          "--wf-ar": `${aspectRatio}`,
                          "--wf-r": `${rotate}deg`,
                          "--wf-x": `${offsetX}`,
                          "--wf-oy": `${image.offsetY ?? 0}px`,
                          "--wf-hidden": `${hiddenOffset(aspectRatio, rotate)}`,
                        } as React.CSSProperties
                      }
                    />
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};
