"use client";

import Link from "next/link";
import React from "react";

export interface WorkFolderImage {
  src: string;
  /**
   * Empty by default: the cards duplicate the folder title, so they are decorative. A card
   * with a `title` is named by it instead.
   */
  alt?: string;
  /** Makes the card a link. Pointing at it also keeps the fan open. */
  href?: string;
  /** Shown above the card while it is pointed at or focused. */
  title?: string;
  /** width / height of the picture. A picture shorter than `cardHeight` gets a blank filler under it. */
  aspectRatio?: number;
  /** Degrees. Overrides the angle this card would get from the fan. */
  rotate?: number;
  /** Multiples of `photoGap`. Nudges the card off the even spacing. */
  offsetX?: number;
  /**
   * Extra lift once the card is out. Use to break a too-regular fan, or pass the tab's rise
   * to bring a card fully clear of the tab.
   */
  offsetY?: WorkFolderLength;
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
  /**
   * The least a card stands out of its folder once revealed. A card is a sheet with its
   * picture at the top, and its foot always stays tucked inside the folder, so it reads
   * as pulled up from inside rather than resting on top. Pictures shorter than this get
   * a blank filler below them to make up the length. Defaults to `photoWidth`.
   */
  cardHeight?: WorkFolderLength;
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
  --wf-caption-size: 20px;
  /* The card caption sits on the page above the folder, not on the panel, so it keeps the
     page's own text colour. */
  --wf-caption-ink: currentColor;
  /* How far a pointed-at card rises out of the fan. */
  --wf-card-lift: 8px;
  /* The sheet each picture is mounted on, which shows as filler under a short one. A
     shade whiter than the page, so it reads as paper stock rather than a hole. */
  --wf-sheet: color-mix(in srgb, white 60%, var(--paper));
  --wf-sheet-edge: var(--rule);
  /* How deep a revealed card's foot stays inside its folder, before its tilt is added.
     Covers the pointed-at lift, so even a raised card never shows its bottom edge. */
  --wf-tuck: calc(var(--wf-card-lift) + 10px);
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

/* A card is a sheet: its picture at the top, then filler down to the foot, which stays
   inside the folder. Long enough to stand out by --wf-card-h, or by the picture's own
   height when that is taller. */
.wf-card {
  --wf-foot: calc(var(--wf-tuck) + var(--wf-photo-w) * var(--wf-bleed));
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: var(--wf-z);
  display: block;
  width: var(--wf-photo-w);
  height: calc(max(var(--wf-card-h), var(--wf-photo-w) / var(--wf-ar)) + var(--wf-foot));
  color: inherit;
  text-decoration: none;
  /* Fan out around the base of each card, so their bottom edges stay on one line. */
  transform-origin: 50% 100%;
  /* Parked past its full height plus its tilt, and 2px more, so neither the sheet's
     hairline nor an antialiased edge peeks out along the fold. */
  transform:
    translateX(calc(-50% + var(--wf-photo-gap) * var(--wf-x)))
    translateY(calc(100% + var(--wf-photo-w) * var(--wf-bleed) + 2px))
    rotate(var(--wf-r));
  transition: transform var(--wf-dur) var(--wf-ease);
}

.wf-sheet {
  display: block;
  height: 100%;
  background-color: var(--wf-sheet);
  box-shadow: 0 0 0 1px var(--wf-sheet-edge);
  transition: translate var(--wf-dur) var(--wf-ease);
}

.wf-card-img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: var(--wf-ar);
  object-fit: cover;
}

/* Cards with a link or a title take the pointer; plain ones stay see-through, as before.
   A parked card is outside the photo box's clip, so it can only be hit once it is out. */
.wf-card-live { pointer-events: auto; }
a.wf-card { cursor: pointer; }

/* Bridges the gap an offsetY lift opens under a card, so the pointer can travel up from the
   folder to the card without the fan closing on the way. */
.wf-card-live::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  height: var(--wf-oy);
}

.wf-card-title {
  position: absolute;
  left: 50%;
  bottom: 100%;
  margin-bottom: calc(var(--wf-caption-size) * 0.5);
  font-family: var(--wf-font-title);
  font-size: var(--wf-caption-size);
  font-style: italic;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
  color: var(--wf-caption-ink);
  opacity: 0;
  translate: -50% 4px;
  /* Never part of the hit area: the card alone decides when it shows. */
  pointer-events: none;
  transition:
    opacity var(--wf-dur) var(--wf-ease),
    translate var(--wf-dur) var(--wf-ease);
}

/* A folder is engaged while its panel, or one of its cards, is pointed at or focused. The
   cards count so the fan stays open as the pointer moves up onto them.
   Engaging any folder repaints all of them … */
.wf:has(:is(.wf-panel, .wf-card-live):hover, :is(.wf-panel, .wf-card):focus-visible) .wf-panel {
  background-color: var(--wf-dim-bg);
  color: var(--wf-dim-ink);
}

/* … except the engaged one, which keeps its colour and rises. */
.wf-item:has(:is(.wf-panel, .wf-card-live):hover, :is(.wf-panel, .wf-card):focus-visible) .wf-panel {
  background-color: var(--wf-color);
  color: var(--wf-ink);
  transform: translateY(calc(-1 * var(--wf-lift)));
}

.wf-item:has(:is(.wf-panel, .wf-card-live):hover, :is(.wf-panel, .wf-card):focus-visible) .wf-photos {
  transform: translateY(calc(-1 * var(--wf-lift)));
}

.wf-item:has(:is(.wf-panel, .wf-card-live):hover, :is(.wf-panel, .wf-card):focus-visible) .wf-card {
  transform:
    translateX(calc(-50% + var(--wf-photo-gap) * var(--wf-x)))
    translateY(calc(var(--wf-foot) - var(--wf-oy)))
    rotate(var(--wf-r));
}

/* The pointed-at card comes to the front of the fan and rises. Only the sheet and its
   caption move: the link itself stays put, so the card cannot slide out from under the
   pointer and flicker. */
.wf-card-live:hover,
.wf-card:focus-visible { z-index: 100; }

.wf-card-live:hover .wf-sheet,
.wf-card:focus-visible .wf-sheet {
  translate: 0 calc(-1 * var(--wf-card-lift));
}

.wf-card-live:hover .wf-card-title,
.wf-card:focus-visible .wf-card-title {
  opacity: 1;
  translate: -50% calc(-1 * var(--wf-card-lift));
}

.wf-panel:focus-visible {
  outline: 2px solid var(--wf-ink);
  outline-offset: -6px;
}

.wf-card:focus-visible { outline: none; }
.wf-card:focus-visible .wf-sheet {
  outline: 2px solid var(--wf-caption-ink);
  outline-offset: 3px;
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
    --wf-caption-size: 17px !important;
  }
  .wf-label + .wf-title { margin-top: 8px; }
  /* One folder per row: spans stop meaning anything once there is only one column. */
  .wf-item { flex-basis: 100%; }
  .wf-blank { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .wf-panel,
  .wf-photos,
  .wf-card,
  .wf-sheet,
  .wf-card-title {
    transition-duration: 0.01ms;
  }
}
`;

/**
 * How far a tilted card's corners swing past its level edges, as a multiple of the card
 * width. Rotating about the bottom centre moves each corner up or down by (w/2)·sinθ. A
 * revealed card tucks its foot this much deeper, so the raised bottom corner stays inside
 * the folder, and a parked one sinks this much further, so the raised top corner does too.
 */
function tiltBleed(deg: number) {
  return Math.sin((Math.abs(deg) * Math.PI) / 180) / 2;
}

const length = (value: WorkFolderLength) =>
  typeof value === "number" ? `${value}px` : value;

/**
 * A stack of overlapping file folders. Hovering one dims the rest and fans that
 * folder's images up from behind its top edge. A card with an href is a link, and one
 * with a title shows it while pointed at; moving onto such a card keeps its fan open.
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
  cardHeight,
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
    "--wf-card-h": cardHeight === undefined ? "var(--wf-photo-w)" : length(cardHeight),
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
                  const live = Boolean(image.href || image.title);
                  const cardProps = {
                    className: `wf-card${live ? " wf-card-live" : ""}`,
                    style: {
                      "--wf-z": `${j}`,
                      "--wf-ar": `${aspectRatio}`,
                      "--wf-r": `${rotate}deg`,
                      "--wf-x": `${offsetX}`,
                      "--wf-oy": length(image.offsetY ?? 0),
                      "--wf-bleed": `${tiltBleed(rotate)}`,
                    } as React.CSSProperties,
                  };
                  const content = (
                    <>
                      <span className="wf-sheet">
                        {/* Sources are arbitrary consumer strings, and next/image refuses
                            SVG without images.dangerouslyAllowSVG. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="wf-card-img"
                          src={image.src}
                          alt={image.alt ?? ""}
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                        />
                      </span>
                      {image.title && (
                        <span className="wf-card-title">{image.title}</span>
                      )}
                    </>
                  );

                  return image.href ? (
                    <Link key={`${image.src}-${j}`} href={image.href} {...cardProps}>
                      {content}
                    </Link>
                  ) : (
                    <span key={`${image.src}-${j}`} {...cardProps}>
                      {content}
                    </span>
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
