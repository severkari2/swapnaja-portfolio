// Project pages under /work/[slug], rebuilt from the designer's PDF layouts rather than
// embedding the PDFs (Brew for You's is 288MB, Nektar's 302MB, Surahi's 294MB, Raya's
// 324MB and The Better Made's 310MB; their images come to about 2.5–3MB each, and Raya's,
// with twice the pictures, to under 5MB).
//
// Every position is in PDF points from the page's top-left corner, measured off the PDF
// itself. From lg up the page lays each block out at exactly that spot, scaled to the
// viewport; below lg the blocks stack in the order listed here, so list them in reading
// order.

export type ProjectFolder = "branding" | "packaging" | "editorial";

/** How a block sits in the stacked layout below lg: a full row, half of one, or edge to edge. */
export type ProjectStack = "full" | "half" | "bleed";

/**
 * Sets the type:
 * - title: Times italic, a section title.
 * - heading: the uppercase section headings, in the project's `face`.
 * - label: small captions such as "LOGO", in the project's `face`.
 * - body: Montserrat Medium prose.
 * - display: Montserrat Medium at display size, one line per row even when stacked.
 */
export type ProjectTextRole = "title" | "heading" | "label" | "body" | "display";

/** A run of text. `italic` sets it in Times italic. */
export type ProjectRun = string | { text: string; italic: true };

/** A line of text as drawn: one run, or several where the face changes mid-line. "" is a blank line. */
export type ProjectLine = ProjectRun | ProjectRun[];

/** The face of the heading and label roles, whichever the PDF sets them in. */
export type ProjectFace = "outfit" | "sans";

/**
 * How an image arrives, where the default wipe (see the project page) doesn't suit it:
 * - deal: a card or swatch, dealt onto the page with a turn of the wrist.
 * - stamp: a postage stamp, pressed down.
 * - write: a wordmark or line drawing, drawn out from the left like ink.
 */
export type ImageMotion = "deal" | "stamp" | "write";

export type ProjectBlock =
  | {
      kind: "image";
      src: string;
      alt: string;
      x: number;
      y: number;
      w: number;
      h: number;
      stack?: ProjectStack;
      motion?: ImageMotion;
      /**
       * Parallax, from lg up: how far the block drifts against the scroll, in tenths of the
       * screen height either side of where the PDF draws it. Positive drifts up, as if it
       * floats nearer. Only for blocks with nothing aligned to them (a caption, a rule).
       */
      depth?: number;
    }
  | {
      kind: "text";
      role: ProjectTextRole;
      /** Left edge and first baseline, in points. */
      x: number;
      baseline: number;
      /** Font size in points. Every PDF so far sets its lines 1.2 apart. */
      size: number;
      /** One entry per line, broken where the PDF breaks it. */
      lines: ProjectLine[];
      /** The PDF's own ink, where it isn't the page's. Drawn over any image it overlaps. */
      color?: string;
      /** Body copy only: its face, where the PDF sets it in the project's instead of Montserrat. */
      face?: ProjectFace;
      stack?: ProjectStack;
    }
  | {
      /**
       * A hairline callout, or a plain block of `color` (ink by default). Only drawn in the
       * PDF layout, since it lines up with what is around it.
       */
      kind: "rule";
      x: number;
      y: number;
      w: number;
      h: number;
      color?: string;
      /** A block of colour that springs up from nothing instead of being wiped in. */
      motion?: "grow";
    }
  | {
      /**
       * Not in the PDF: a band that opens the page up at `y`, pushing everything below it
       * down by `h`, with the project's own line running across it as you scroll. The line
       * is one the designer set on a piece of the project.
       */
      kind: "slogan";
      y: number;
      h: number;
      text: string;
    }
  | {
      /**
       * A panel of `color` that cuts through `slides` once a second, like a flip through a
       * printed piece (MenuSlideshow). Each slide is a spread or a single page, `aspect`
       * its width over height. Drawn at every size.
       */
      kind: "slideshow";
      label: string;
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      slides: { src: string; aspect: number }[];
    };

export interface Project {
  slug: string;
  title: string;
  /** The folders on /work whose cards include this project. */
  folders: ProjectFolder[];
  /** Its card in those folders. */
  cover: { src: string; aspectRatio: number };
  /** Size of the PDF page the blocks were measured on, in points. */
  page: { width: number; height: number };
  /** Defaults to Outfit. */
  face?: ProjectFace;
  /** The brand's own ink, for the slogan band. */
  accent: string;
  /**
   * The full-bleed photo the PDF opens with. The page lifts it out of the layout into its
   * opening title sequence, so `blocks` start below it.
   */
  hero: { src: string; alt: string; w: number; h: number };
  blocks: ProjectBlock[];
}

const brew = (file: string) => `/work/brew-for-you/${file}`;
const nektar = (file: string) => `/work/nektar/${file}`;
const surahi = (file: string) => `/work/surahi/${file}`;
const raya = (file: string) => `/work/raya/${file}`;
const betterMade = (file: string) => `/work/the-better-made/${file}`;

// Brew for You's navy and Raya's maroon, the grounds of their logo cards.
const brewNavy = "#123c60";
const rayaMaroon = "#36120c";

// The Better Made's green, the ink of its wordmark, and the olive block behind its tags.
const betterMadeGreen = "#425a2b";
const betterMadeOlive = "#818653";

// Nektar's own inks: its orange, and the rust it sets its Times italic lines in.
const nektarOrange = "#ee6023";
const nektarRust = "#af4025";

// Surahi's olive, which fills the two menu panels, and the near-black of its third panel.
const surahiOlive = "#4f4c1f";
const surahiBlack = "#231f20";

// The menus, rendered out of their PDFs (food menu final.pdf, beverage menu final.pdf) at
// the trim box: the cover alone, the pages in spreads, the back cover alone. The print look
// of surahi_collage_refrence.mp4 is baked in: paper held at 94% white, a static mottle, the
// crease at the fold and a darker lip along the bottom edge.
const menu = (name: string, count: number, page: number) =>
  Array.from({ length: count }, (_, i) => ({
    src: surahi(`${name}-menu-${i + 1}.jpg`),
    aspect: i === 0 || i === count - 1 ? page : page * 2,
  }));

export const projects: Project[] = [
  {
    slug: "brew-for-you",
    title: "Brew For You",
    folders: ["branding"],
    cover: { src: brew("logo.jpg"), aspectRatio: 563 / 422 },
    page: { width: 1195.28, height: 7786.41 },
    accent: brewNavy,
    hero: { src: brew("hero-counter.jpg"), alt: "A barista in a Brew for You T-shirt working behind the café counter", w: 1195.28, h: 798.97 },
    blocks: [
      { kind: "image", src: brew("croissant-bag.jpg"), alt: "A woman on the street holding a croissant and a Brew for You paper bag", x: 386.92, y: 873.87, w: 428.71, h: 334.6 },
      { kind: "text", role: "title", x: 469.11, baseline: 1255.11, size: 32.97, lines: ["About Brew for you"] },
      {
        kind: "text",
        role: "body",
        x: 452.08,
        baseline: 1287.05,
        size: 12,
        lines: [
          "Brew for You is a café-bar concept designed around",
          "the balance between work and leisure. It offers a cozy",
          "space to work, meet friends, and unwind, while",
          "transforming into a lively social space with coffee raves",
          "and weekend events. The identity combines bold",
          "typography, warm colours, and playful visuals to reflect",
          "its relaxed yet energetic personality.",
        ],
      },

      { kind: "image", src: brew("logo.jpg"), alt: "The Brew for You logo in cream on navy", x: 66.75, y: 1491.09, w: 328.67, h: 246.5, stack: "half" },
      { kind: "image", src: brew("logomark.jpg"), alt: "The Brew for You logomark, a tall letter B, in cream on navy", x: 795.65, y: 1491.09, w: 323.37, h: 198.79, stack: "half" },
      { kind: "text", role: "label", x: 69.31, baseline: 1756.45, size: 12, lines: ["LOGO"], stack: "half" },
      { kind: "text", role: "label", x: 797.65, baseline: 1712.74, size: 12, lines: ["LOGOMARK"], stack: "half" },
      { kind: "image", src: brew("bottle-almond-milk.jpg"), alt: "A bottle of almond milk coffee with a Brew for You label, lying on linen", x: 433.85, y: 1491.09, w: 320.72, h: 490.35, depth: 0.6 },

      { kind: "text", role: "heading", x: 68.59, baseline: 2078.09, size: 24, lines: ["THOUGHT BEHIND", "THE LOGO"] },
      { kind: "image", src: brew("logo-drawing.png"), alt: "The Brew for You wordmark in black", x: 455.47, y: 2186.99, w: 184.87, h: 209.31, motion: "write" },
      { kind: "text", role: "body", x: 455.62, baseline: 2060.16, size: 12, lines: ["High-contrast serif typography", "creates a strong visual presence."] },
      { kind: "rule", x: 465.23, y: 2116.64, w: 1, h: 44.46 },
      { kind: "text", role: "body", x: 195.02, baseline: 2203.84, size: 12, lines: ["The altered letterforms", "give the logo a", "distinctive,", "contemporary", "character."] },
      { kind: "rule", x: 343.18, y: 2203.28, w: 44.46, h: 1 },
      { kind: "rule", x: 622.47, y: 2402.59, w: 1, h: 44.46 },
      { kind: "text", role: "body", x: 551.69, baseline: 2464.6, size: 12, lines: ["The bold type paired with", "the supporting colour", "palette makes the identity", "feel dynamic and", "memorable."] },
      { kind: "image", src: brew("storefront.jpg"), alt: "A customer sipping coffee outside the café, beneath its chalkboard menu", x: 808.28, y: 2031.97, w: 288, h: 423, depth: -0.4 },

      { kind: "text", role: "label", x: 82.5, baseline: 2646.23, size: 12, lines: ["COLOR"] },
      { kind: "image", src: brew("palette.svg"), alt: "The colour palette: navy, blush, and oxblood pills, each with a cream, brown, or grey starburst", x: 63.66, y: 2668.14, w: 360.25, h: 292.96, motion: "deal" },
      { kind: "text", role: "label", x: 625.72, baseline: 2646.23, size: 12, lines: ["TYPOGRAPHY"] },
      {
        kind: "text",
        role: "display",
        x: 625.71,
        baseline: 2705.32,
        size: 48,
        lines: [
          "Primary font",
          { text: "Customised", italic: true },
          "",
          "Secondary font",
          { text: "Montserrat", italic: true },
        ],
      },

      { kind: "slogan", y: 2990, h: 300, text: "sharp. simple. focused." },

      { kind: "text", role: "heading", x: 83.06, baseline: 3067.69, size: 24, lines: ["THOUGHT BEHIND", "THE PACKAGING AND BRANDING"] },
      { kind: "image", src: brew("espresso.jpg"), alt: "An espresso martini over a chessboard, captioned “Espresso: sharp. simple. focused.”", x: 74.38, y: 3168.79, w: 500.86, h: 361.5 },
      { kind: "image", src: brew("bottles-milk-tea.jpg"), alt: "Two bottles of milk tea with Brew for You labels", x: 612.74, y: 3168.79, w: 505.72, h: 287.74 },
      { kind: "image", src: brew("menu.jpg"), alt: "Hands holding the Brew for You bakery and breakfast menu", x: 69.52, y: 3567.76, w: 326.44, h: 412.84, stack: "half" },
      { kind: "image", src: brew("croissants.jpg"), alt: "The Brew for You logo over a tray of croissants", x: 431.69, y: 3567.76, w: 236.19, h: 176.65, stack: "half" },
      { kind: "image", src: brew("pour.jpg"), alt: "A barista pouring cold brew over ice", x: 703.61, y: 3568.49, w: 414.85, h: 580.83 },

      { kind: "image", src: brew("method-percolator.jpg"), alt: "Brewing-method card: percolator", x: 43.06, y: 4237.75, w: 286.28, h: 226.88, stack: "half", motion: "deal" },
      { kind: "image", src: brew("method-french-press.jpg"), alt: "Brewing-method card: french press", x: 403.64, y: 4207.42, w: 368.64, h: 287.54, stack: "half", motion: "deal" },
      { kind: "image", src: brew("method-turkish-coffee-pot.jpg"), alt: "Brewing-method card: turkish coffee pot", x: 853.01, y: 4241.5, w: 281.25, h: 219.38, stack: "half", motion: "deal" },
      { kind: "image", src: brew("method-chemex.jpg"), alt: "Brewing-method card: chemex", x: 42.6, y: 4564.02, w: 284.5, h: 221.91, stack: "half", motion: "deal" },
      { kind: "image", src: brew("method-pour-over.jpg"), alt: "Brewing-method card: pour-over", x: 401.2, y: 4530.97, w: 369.23, h: 288, stack: "half", motion: "deal" },
      { kind: "image", src: brew("method-moka-pot.jpg"), alt: "Brewing-method card: moka pot", x: 844.03, y: 4562.47, w: 288.46, h: 225, stack: "half", motion: "deal" },

      { kind: "image", src: brew("bottles-row.jpg"), alt: "A row of Brew for You bottles: almond milk coffee, milk tea, and cold brew", x: 69.52, y: 4891.38, w: 414.75, h: 234.88 },
      { kind: "image", src: brew("pour-detail.jpg"), alt: "Close-up of cold brew being poured", x: 521.01, y: 4891.38, w: 326.57, h: 194.69, stack: "half" },
      { kind: "image", src: brew("espresso-post.jpg"), alt: "Social post: espresso martini, “sharp. simple. focused.”", x: 885.26, y: 4891.38, w: 233.2, h: 179.62, stack: "half" },
      { kind: "image", src: brew("coffee-and-stories.jpg"), alt: "Navy banner reading “coffee & stories” with a small café illustration", x: 69.52, y: 5167.04, w: 232.01, h: 128.93 },
      { kind: "image", src: brew("brew-box.jpg"), alt: "Teal coffee gear on a Brew for You box", x: 337.25, y: 5167.04, w: 236.11, h: 292.03, stack: "half" },
      { kind: "image", src: brew("almost-friday.jpg"), alt: "A crowded café-bar night, captioned “almost friday”", x: 610.64, y: 5167.04, w: 507.82, h: 292.03, stack: "half" },
      { kind: "image", src: brew("bottles-milk-tea-tall.jpg"), alt: "Two bottles of milk tea with Brew for You labels, close up", x: 69.52, y: 5489.05, w: 503.84, h: 715.22 },
      { kind: "image", src: brew("bottle-labels.jpg"), alt: "Brew for You bottle labels, close up", x: 610.64, y: 5489.05, w: 507.82, h: 305.37 },
      { kind: "image", src: brew("its-monday.jpg"), alt: "Two takeaway cups with Brew for You sleeves, captioned “it’s monday”", x: 610.79, y: 5846.66, w: 234.73, h: 136.93, stack: "half" },
      { kind: "image", src: brew("coaster.jpg"), alt: "An iced coffee on a Brew for You coaster", x: 883.8, y: 5846.66, w: 236.43, h: 241.54, stack: "half" },
      { kind: "image", src: brew("loyalty-cards.jpg"), alt: "Brew for You loyalty and business cards next to matcha powder", x: 610.79, y: 6122.84, w: 509.44, h: 297.3 },
      { kind: "image", src: brew("tote.jpg"), alt: "A canvas tote printed with a percolator illustration", x: 69.88, y: 6444.37, w: 682.3, h: 373.24 },
      { kind: "image", src: brew("tshirt.jpg"), alt: "The back of a staff T-shirt with an illustrated character", x: 796.38, y: 6452.45, w: 323.85, h: 365.16 },
      { kind: "image", src: brew("awning.jpg"), alt: "A navy café awning carrying the Brew for You logo", x: 614.47, y: 6860.02, w: 509.44, h: 297.29 },
      { kind: "image", src: brew("menu-banner.jpg"), alt: "The Brew for You logo over a café with a hand-painted menu banner", x: 71.36, y: 7181.55, w: 686.69, h: 373.24 },
      { kind: "image", src: brew("pour-over-post.jpg"), alt: "Social post: a steaming pour-over coffee", x: 800.06, y: 7189.63, w: 323.85, h: 365.16 },
    ],
  },
  {
    slug: "nektar",
    title: "Nektar",
    folders: ["packaging"],
    cover: { src: nektar("logo.svg"), aspectRatio: 328.7 / 246.5 },
    page: { width: 1195.28, height: 6711.83 },
    face: "sans",
    accent: nektarRust,
    hero: { src: nektar("hero-can.jpg"), alt: "Hands pulling the tab on a can of Nektar lemon-lime & orange caffeinated water, over a desk of handwritten scent notes", w: 1195.28, h: 798.97 },
    blocks: [
      { kind: "image", src: nektar("oranges.jpg"), alt: "Halved oranges, close up", x: 387.54, y: 945.71, w: 421.34, h: 262.76 },
      { kind: "rule", x: 510.1, y: 853, w: 175.1, h: 175.1, color: nektarOrange, motion: "grow" },
      { kind: "text", role: "title", x: 503.79, baseline: 1255.11, size: 32.97, lines: ["About Nektar"] },
      {
        kind: "text",
        role: "body",
        x: 452.11,
        baseline: 1287.06,
        size: 12,
        lines: [
          "Surahi is a poolside bar at Wyndham Resort, Udaipur,",
          "created for laid-back days, good food, and refreshing",
          "drinks. Blending a relaxed poolside atmosphere with a",
          "vibrant dining experience, Surahi is a space to unwind,",
          "sip, snack, and soak in the Udaipur sun.",
        ],
      },

      { kind: "image", src: nektar("logo.svg"), alt: "The Nektar wordmark in white on orange", x: 71.5, y: 1483, w: 328.7, h: 246.5, stack: "half" },
      { kind: "image", src: nektar("logomark.svg"), alt: "The Nektar logomark, a flared letter N, in white on orange", x: 800.4, y: 1483, w: 323.4, h: 198.8, stack: "half" },
      { kind: "text", role: "label", x: 72.5, baseline: 1752, size: 12, lines: ["LOGO"], stack: "half" },
      { kind: "text", role: "label", x: 797.64, baseline: 1698.39, size: 12, lines: ["LOGOMARK"], stack: "half" },
      { kind: "image", src: nektar("can-in-orange.jpg"), alt: "A can of Nektar lemon-lime & orange nestled inside a split orange", x: 452.11, y: 1485.4, w: 320.71, h: 483.57, depth: 0.6 },

      { kind: "text", role: "label", x: 82.5, baseline: 2053.75, size: 12, lines: ["COLOR"] },
      { kind: "image", src: nektar("swatch-orange.svg"), alt: "Colour swatch: orange, with a cream swirl motif", x: 83.1, y: 2077.2, w: 177.7, h: 287.8, stack: "half", motion: "deal" },
      { kind: "image", src: nektar("swatch-guava.svg"), alt: "Colour swatch: guava pink, with a deep red swirl motif", x: 280, y: 2077.2, w: 177.7, h: 287.8, stack: "half", motion: "deal" },
      { kind: "text", role: "label", x: 625.72, baseline: 2053.75, size: 12, lines: ["TYPOGRAPHY"] },
      {
        kind: "text",
        role: "display",
        x: 625.71,
        baseline: 2112.84,
        size: 48,
        lines: [
          "Primary font",
          { text: "Montserrat", italic: true },
          "",
          "Secondary font",
          { text: "Bricolage Grotesque", italic: true },
          { text: "Caveat", italic: true },
        ],
      },

      { kind: "slogan", y: 2440, h: 300, text: "refresh. reboot. rework." },

      { kind: "text", role: "heading", x: 81.66, baseline: 2508.97, size: 24, lines: ["THOUGHT BEHIND", "THE PACKAGING"] },
      { kind: "image", src: nektar("net-of-oranges.jpg"), alt: "A can of Nektar lemon-lime & orange in a red net bag of oranges", x: 77.56, y: 2602.59, w: 505.72, h: 361.5 },
      { kind: "image", src: nektar("friends-toast.jpg"), alt: "Friends reaching across a table to toast with cans of Nektar", x: 620.78, y: 2602.59, w: 505.72, h: 287.74 },
      { kind: "image", src: nektar("back-pocket.jpg"), alt: "A can of Nektar pink guava tucked into the back pocket of a pair of jeans", x: 77.56, y: 3001.55, w: 326.44, h: 412.85, stack: "half" },
      { kind: "image", src: nektar("motion-blur.jpg"), alt: "A runner in orange, blurred in motion on a track", x: 445.46, y: 3001.55, w: 236.2, h: 176.65, stack: "half" },
      { kind: "image", src: nektar("guava-bowl.jpg"), alt: "A can of Nektar pink guava tipped into a steel coupe beside halved guavas", x: 711.65, y: 3001.55, w: 414.85, h: 581.56 },
      // The PDF draws these under the back-pocket photo, so the export leaves that corner clear.
      { kind: "image", src: nektar("labels.webp"), alt: "The flat can labels for lemon-lime & orange and pink guava, with Dozy the sloth surfing on one and lifting weights on the other", x: 56.8, y: 3377.9, w: 506.8, h: 803.9 },
      {
        kind: "text",
        role: "body",
        x: 711.65,
        baseline: 3643.05,
        size: 12,
        lines: [
          "The surface graphics for Nektar",
          "are designed to feel bold,",
          "energetic, and playful.",
          "",
          "The bright colour palette creates",
          "an immediate visual impact,",
          ["while the oversized ", { text: "NEKTAR", italic: true }],
          "wordmark gives the cans a",
          "strong, recognisable presence.",
          "",
          "Supporting illustrations, organic",
          "shapes, and flavour-led elements",
          "add a sense of movement and",
          "personality, reflecting the",
          "brand’s youthful and",
          "adventurous character.",
          "",
          "The overall system balances",
          "expressive graphics with clear",
          "product information, making the",
          "can feel fresh, contemporary,",
          "and easy to recognise.",
        ],
      },

      { kind: "image", src: nektar("car-toast.jpg"), alt: "Two friends in a car raising a can of Nektar pink guava", x: 68.56, y: 4255.44, w: 505.72, h: 361.51 },
      { kind: "image", src: nektar("street-sip.jpg"), alt: "A man in a cap drinking from a can of Nektar on a city street", x: 611.78, y: 4255.44, w: 505.72, h: 292.03 },
      { kind: "image", src: nektar("paper-bag.jpg"), alt: "A can of Nektar pink guava in a brown paper bag beside halved guavas", x: 68.56, y: 4654.41, w: 326.44, h: 412.85, stack: "half" },
      { kind: "image", src: nektar("late-night.jpg"), alt: "A woman drinking from a can at her desk late at night, laptop open", x: 426.79, y: 4653.52, w: 236.2, h: 176.65, stack: "half" },
      { kind: "text", role: "title", x: 690.63, baseline: 4654.41, size: 48, lines: ["how to fix", "a bad day"], color: nektarRust },
      { kind: "image", src: nektar("ice-bucket.jpg"), alt: "Cans of Nektar lemon-lime & orange with pink straws and lemon slices in an ice bucket", x: 702.65, y: 4654.41, w: 414.85, h: 581.56 },

      { kind: "image", src: nektar("refresh-reboot-rework.jpg"), alt: "“refresh. reboot. rework.” in rust italic on orange", x: 68.6, y: 5293.4, w: 232, h: 162.9, stack: "half", motion: "deal" },
      { kind: "image", src: nektar("sunburst.jpg"), alt: "A silhouette holding the sun between their hands over the sea", x: 336.29, y: 5293.36, w: 236.11, h: 292.03, stack: "half" },
      { kind: "image", src: nektar("eyes-closed.jpg"), alt: "A young man with his eyes closed, drinking from a can of Nektar pink guava", x: 611.09, y: 5279.6, w: 506.41, h: 305.37 },
      { kind: "image", src: nektar("chessboard.jpg"), alt: "Hands over a drinking-game chessboard of shot glasses", x: 68.56, y: 5615.37, w: 503.84, h: 715.21 },
      { kind: "image", src: nektar("straw.jpg"), alt: "A young man sipping through a straw, seen through a fisheye lens", x: 613.5, y: 5624.18, w: 504, h: 287.74 },
    ],
  },
  {
    slug: "surahi",
    title: "Surahi",
    folders: ["branding"],
    cover: { src: surahi("logo.svg"), aspectRatio: 328.67 / 246.5 },
    page: { width: 1195.28, height: 9899.33 },
    face: "sans",
    accent: surahiOlive,
    hero: { src: surahi("hero.jpg"), alt: "The Surahi lounge: patterned sofas beneath the Surahi wall sign, lit by a brass lantern", w: 1195.28, h: 798.97 },
    blocks: [
      { kind: "image", src: surahi("about-stand.jpg"), alt: "A tiered stand of lime wedges and shot glasses on the bar, framed as a postage stamp", x: 496.81, y: 900.24, w: 197.04, h: 294.1, motion: "stamp" },
      { kind: "text", role: "title", x: 507.67, baseline: 1243.87, size: 32.97, lines: ["About Surahi"] },
      {
        kind: "text",
        role: "body",
        x: 453.82,
        baseline: 1275.81,
        size: 12,
        lines: [
          "Surahi is a poolside bar at Wyndham Resort, Udaipur,",
          "created for laid-back days, good food, and refreshing",
          "drinks. Blending a relaxed poolside atmosphere with a",
          "vibrant dining experience, Surahi is a space to unwind,",
          "sip, snack, and soak in the Udaipur sun.",
        ],
      },

      { kind: "image", src: surahi("logo.svg"), alt: "The Surahi logo, an illustrated surahi flowing into the wordmark, in olive on sand", x: 88.54, y: 1477.93, w: 328.67, h: 246.5, stack: "half" },
      { kind: "image", src: surahi("logomark.svg"), alt: "The Surahi logomark, the illustrated surahi on an olive pebble", x: 817.44, y: 1477.93, w: 323.37, h: 198.79, stack: "half" },
      { kind: "text", role: "label", x: 109.2, baseline: 1755.9, size: 12, lines: ["LOGO"], stack: "half" },
      { kind: "text", role: "label", x: 838.26, baseline: 1698.39, size: 12, lines: ["LOGOMARK"], stack: "half" },
      { kind: "image", src: surahi("pick-your-mood.jpg"), alt: "A cocktail card: a coupe of orange liqueur above the line “Pick your mood, we’ll pour the rest.”", x: 461, y: 1391.79, w: 292, h: 526.5, depth: 0.6 },

      { kind: "text", role: "heading", x: 68.59, baseline: 2078.09, size: 24, lines: ["THOUGHT BEHIND", "THE LOGO"] },
      { kind: "image", src: surahi("wordmark.svg"), alt: "The Surahi logo in black", x: 403.97, y: 2156.56, w: 315.06, h: 123.44, motion: "write" },
      {
        kind: "text",
        role: "body",
        x: 480.21,
        baseline: 2071.3,
        size: 12,
        lines: [
          "The surahi flows naturally into",
          "the wordmark, making the",
          "symbol and typography feel like",
          "one cohesive mark rather than",
          "separate elements.",
        ],
      },
      { kind: "rule", x: 489.81, y: 2144.97, w: 1, h: 44.52 },
      {
        kind: "text",
        role: "body",
        x: 195.02,
        baseline: 2188.14,
        size: 12,
        lines: [
          "The illustrated",
          "surahi acts as the",
          "key visual symbol,",
          "immediately",
          "connecting the",
          "identity to Indian",
          "culture, craft and",
          "traditional vessels.",
        ],
      },
      { kind: "rule", x: 343.18, y: 2187.61, w: 44.52, h: 1 },
      { kind: "rule", x: 632.87, y: 2294.77, w: 1, h: 44.52 },
      {
        kind: "text",
        role: "body",
        x: 562.1,
        baseline: 2356.78,
        size: 12,
        lines: [
          "A bold, rounded serif typeface",
          "gives the logo a soft, elegant and",
          "handcrafted character,",
          "balancing tradition with a",
          "contemporary feel.",
        ],
      },
      { kind: "image", src: surahi("stamp.svg"), alt: "An olive postage stamp with a cream sun over waves", x: 813.66, y: 2035.24, w: 278.54, h: 402.62, motion: "stamp" },

      { kind: "text", role: "label", x: 96.67, baseline: 2548.82, size: 12, lines: ["COLOR"] },
      { kind: "image", src: surahi("swatch-brown.svg"), alt: "Colour swatch: brown, with a cream swirl motif", x: 97.24, y: 2572.3, w: 177.69, h: 287.74, stack: "half", motion: "deal" },
      { kind: "image", src: surahi("swatch-cream.svg"), alt: "Colour swatch: cream, with an olive swirl motif", x: 294.16, y: 2572.3, w: 177.69, h: 287.74, stack: "half", motion: "deal" },
      { kind: "text", role: "label", x: 639.89, baseline: 2548.82, size: 12, lines: ["TYPOGRAPHY"] },
      {
        kind: "text",
        role: "display",
        x: 639.89,
        baseline: 2607.91,
        size: 48,
        lines: [
          "Primary font",
          { text: "Montserrat", italic: true },
          "",
          "Secondary font",
          { text: "Baskerville", italic: true },
        ],
      },

      { kind: "slogan", y: 2905, h: 300, text: "Pick your mood, we’ll pour the rest." },

      { kind: "image", src: surahi("postcard.jpg"), alt: "Surahi postcards over banana leaves, one showing the resort’s domed pavilion", x: 73.17, y: 2964.83, w: 496.05, h: 399.35 },
      { kind: "image", src: surahi("mindful-mover.jpg"), alt: "A poster reading “For the mindful mover”, beside a woman stretching on a towel in the sand", x: 75.24, y: 3394.19, w: 344.64, h: 191.52 },
      { kind: "image", src: surahi("poolside.jpg"), alt: "Legs stretched out on a poolside lounger, beside an aperitif and a deck of cards", x: 594.18, y: 2964.83, w: 513.08, h: 641.12 },

      { kind: "text", role: "label", x: 79.94, baseline: 3673.15, size: 12.23, lines: ["BEVERAGE MENU"] },
      { kind: "slideshow", label: "The Surahi beverage menu, spread by spread", x: 74.37, y: 3713.09, w: 1056.34, h: 575.18, color: surahiOlive, slides: menu("beverage", 9, 550 / 1200) },
      { kind: "image", src: surahi("beverage-menu.jpg"), alt: "The Surahi beverage menu, an embossed green cover with the logo in cream, laid on a dinner plate", x: 78.07, y: 4315.72, w: 571.43, h: 588.67, stack: "half" },
      { kind: "image", src: surahi("menu-holder.jpg"), alt: "A wooden menu holder engraved with the Surahi logo", x: 693.32, y: 4315.72, w: 437.39, h: 604.49, stack: "half" },
      { kind: "text", role: "label", x: 74.37, baseline: 4953.41, size: 12.23, lines: ["basic idea"] },
      { kind: "image", src: surahi("glass-sketch.jpg"), alt: "A black-and-white photo of a hand at the table, with a wine glass picked out in cream", x: 74.59, y: 4997.78, w: 518.57, h: 384.92 },
      { kind: "image", src: surahi("drinks-menu.jpg"), alt: "The open Surahi drinks menu, listing cocktails such as Khaade Masaale and Marygranate Mimosa", x: 611.01, y: 4997.78, w: 519.7, h: 634.14 },
      { kind: "image", src: surahi("napkin.jpg"), alt: "An olive napkin printed with the Surahi logo, under the foot of a glass", x: 74.37, y: 5414.84, w: 383.61, h: 217.08 },
      { kind: "image", src: surahi("shaker.jpg"), alt: "A bartender’s cocktail shaker, blurred mid-shake", x: 126.71, y: 5654.26, w: 326.57, h: 194.69, stack: "half" },
      { kind: "image", src: surahi("pour.svg"), alt: "A line drawing of hands pouring from a bottle, in olive", x: 860.48, y: 5698.46, w: 333.43, h: 328.43, stack: "half", motion: "write" },
      { kind: "image", src: surahi("thank-you-card.jpg"), alt: "A brown card framing a pavilion arch, reading “would love to host you again”", x: 74.37, y: 5883.97, w: 236.11, h: 292.03, stack: "half", motion: "deal" },
      { kind: "image", src: surahi("reserved.jpg"), alt: "A “Reserved” table card carrying the Surahi mark, on a wooden stand", x: 87.42, y: 6198.46, w: 405.15, h: 513.37, stack: "half" },
      { kind: "image", src: surahi("apron.jpg"), alt: "An olive apron embroidered with the Surahi logo", x: 329.68, y: 5894.03, w: 507.81, h: 292.02 },
      { kind: "rule", x: 504.42, y: 6199.13, w: 511.52, h: 305.38, color: surahiBlack },

      { kind: "text", role: "label", x: 71.01, baseline: 6773.63, size: 12.23, lines: ["FOOD MENU"] },
      { kind: "slideshow", label: "The Surahi food menu, spread by spread", x: 62.4, y: 6821.97, w: 1056.34, h: 575.18, color: surahiOlive, slides: menu("food", 6, 848 / 1200) },
      { kind: "image", src: surahi("food-menu.jpg"), alt: "The open Surahi food menu in a ring binder, listing vegetarian and non-vegetarian starters", x: 62.4, y: 7457.15, w: 604.49, h: 604.49, stack: "half" },
      { kind: "image", src: surahi("tablet-menu.jpg"), alt: "Hands holding the Surahi snack menu at a café table", x: 691.44, y: 7456.96, w: 427.3, h: 604.87, stack: "half" },
      { kind: "image", src: surahi("platter.jpg"), alt: "Guests reaching for canapés served on banana leaves", x: 456.68, y: 8106.69, w: 662.06, h: 417.23 },
      { kind: "image", src: surahi("serve.svg"), alt: "A line drawing of one figure seasoning a dish that another holds out, in olive", x: 62.26, y: 8075.81, w: 361.81, h: 365.23, stack: "half", motion: "write" },
      { kind: "image", src: surahi("hallway.jpg"), alt: "A painted palace corridor with the Surahi logomark", x: 698.77, y: 8589.72, w: 419.97, h: 473.25, stack: "half" },
      { kind: "image", src: surahi("motifs.jpg"), alt: "A painted mural of cranes, pheasants and palms by the water, framed as a postage stamp", x: 82.58, y: 8588.13, w: 566.39, h: 391.84, motion: "stamp" },
      { kind: "text", role: "body", x: 86.77, baseline: 9024.97, size: 21.75, lines: ["personalised motifs"] },

      // The closing panel is one picture: the resort photo's rounded corners sit on the
      // panel's cream, which is not the page's paper.
      { kind: "image", src: surahi("closing.jpg"), alt: "Wyndham Resort, Udaipur, at dusk, beside the Surahi logo", x: 62.4, y: 9146.92, w: 1056.34, h: 611.77 },
    ],
  },
  {
    slug: "raya",
    title: "Raya",
    folders: ["branding", "packaging"],
    cover: { src: raya("logo.jpg"), aspectRatio: 329.04 / 251.27 },
    page: { width: 1195.28, height: 11597.6 },
    face: "sans",
    accent: rayaMaroon,
    hero: { src: raya("hero.jpg"), alt: "The Raya cast in festive Indian wear, seated on steps strewn with rose petals around the Raya logo", w: 1195.28, h: 800.23 },
    // Raya's wordmarks are set in Samarkan, and its banners in Baskervville and Outfit, so
    // every line in those faces is part of its picture. Only the Montserrat and Times
    // italic lines are text here.
    blocks: [
      // The motif and the two taped-up photos are one composition.
      { kind: "image", src: raya("about.webp"), alt: "A blush floral motif beside two taped-up photos of a model in an orange top and olive trousers, front and back", x: 77.6, y: 802, w: 713.26, h: 517.8 },
      { kind: "text", role: "title", x: 518.61, baseline: 1255.07, size: 32.97, lines: ["About Raya"] },
      {
        kind: "text",
        role: "body",
        x: 476.63,
        baseline: 1287.05,
        size: 12,
        lines: [
          "Raya is a contemporary Indian fashion label that",
          "reimagines traditional craftsmanship through",
          "modern, refined silhouettes. Rooted in heritage",
          "and designed for today, Raya celebrates culture,",
          "connection and timeless elegance through",
          "thoughtfully crafted apparel made for every",
          "celebration.",
        ],
      },

      { kind: "image", src: raya("logo.jpg"), alt: "The Raya logo, “raya by Bhumi Goyanka”, in blush on maroon", x: 68.59, y: 1477.3, w: 329.04, h: 251.27, stack: "half" },
      { kind: "image", src: raya("logomark.jpg"), alt: "The Raya logomark, a letter r with a teardrop, in blush on maroon", x: 797.65, y: 1477.29, w: 329.03, h: 199.57, stack: "half" },
      { kind: "text", role: "label", x: 68.59, baseline: 1755.85, size: 12, lines: ["LOGO"], stack: "half" },
      { kind: "text", role: "label", x: 797.65, baseline: 1698.35, size: 12, lines: ["LOGOMARK"], stack: "half" },
      { kind: "image", src: raya("shared-plate.jpg"), alt: "A woman feeding a laughing man from a bowl, before a patterned hanging", x: 437.57, y: 1477.3, w: 320.14, h: 491.53, depth: 0.6 },

      { kind: "text", role: "heading", x: 68.59, baseline: 2078.05, size: 24, lines: ["THOUGHT BEHIND", "THE LOGO"] },
      { kind: "text", role: "body", x: 500.95, baseline: 2102.99, size: 12, lines: ["Represents continuity,", "connection and", "the thread of relationships."] },
      { kind: "rule", x: 510.55, y: 2143.54, w: 1, h: 44.52 },
      { kind: "text", role: "body", x: 232.21, baseline: 2188.06, size: 12, lines: ["Symbolises growth,", "beauty, femininity and", "Indian craftsmanship."] },
      { kind: "rule", x: 380.37, y: 2187.56, w: 44.52, h: 1 },
      { kind: "image", src: raya("wordmark.webp"), alt: "The Raya wordmark in black", x: 450.9, y: 2136.4, w: 263.63, h: 153.03, motion: "write" },
      { kind: "rule", x: 632.87, y: 2294.73, w: 1, h: 44.52 },
      { kind: "text", role: "body", x: 562.1, baseline: 2356.71, size: 12, lines: ["Elegant, flowing and", "contemporary,", "balancing tradition with modernity."] },
      { kind: "image", src: raya("tradition.jpg"), alt: "A rust card reading “Where tradition finds its modern form.”", x: 772.92, y: 2011.34, w: 378.49, h: 472.77, depth: -0.4 },

      { kind: "text", role: "label", x: 96.67, baseline: 2548.77, size: 12, lines: ["COLOR"] },
      { kind: "image", src: raya("palette.svg"), alt: "The colour palette: blush, rust, black and sand swatches, each with a starburst, around a maroon one", x: 97.2, y: 2561.4, w: 410.9, h: 337.4, motion: "deal" },
      { kind: "text", role: "label", x: 639.89, baseline: 2548.77, size: 12, lines: ["TYPOGRAPHY"] },
      {
        kind: "text",
        role: "display",
        x: 639.89,
        baseline: 2607.87,
        size: 48,
        lines: [
          "Primary font",
          { text: "Outfit", italic: true },
          "",
          "Secondary font",
          { text: "Baskerville", italic: true },
        ],
      },

      { kind: "slogan", y: 2930, h: 300, text: "Where tradition finds its modern form." },

      { kind: "text", role: "label", x: 73.17, baseline: 2981.94, size: 12, lines: ["PACKAGING"] },
      // The tag hangs over the foot of the cloth photo, so the two are one picture.
      { kind: "image", src: raya("cloth-and-tag.webp"), alt: "A cream dust bag stitched with the Raya logo, and a maroon swing tag on a blush card", x: 73.17, y: 3009.92, w: 413.8, h: 514.35, stack: "half" },
      { kind: "image", src: raya("gift-boxes.jpg"), alt: "Gold and maroon Raya gift boxes beside a vintage typewriter", x: 524.97, y: 3006.87, w: 326.57, h: 408.06, stack: "half" },
      { kind: "image", src: raya("envelope.jpg"), alt: "A maroon Raya envelope and a card with a gold wax seal", x: 888.91, y: 3009, w: 233.19, h: 179.61, stack: "half", motion: "deal" },
      { kind: "image", src: raya("pov.jpg"), alt: "An illustrated card of two women whispering, captioned “POV: You just found Raya.”", x: 894.61, y: 3218.12, w: 236.1, h: 289.84, stack: "half", motion: "deal" },

      { kind: "text", role: "label", x: 84.29, baseline: 3535.87, size: 12, lines: ["COLLECTIONS"] },
      { kind: "text", role: "label", x: 84.29, baseline: 3560.66, size: 12, lines: ["About the collection"] },
      { kind: "image", src: raya("mehr-website.jpg"), alt: "The Raya website’s festive-season banner: friends in festive wear sharing sweets", x: 74.37, y: 3606.17, w: 1056.34, h: 604.49 },
      { kind: "text", role: "label", x: 74.37, baseline: 4243.86, size: 12, lines: ["website", "graphics"] },
      { kind: "image", src: raya("mehr-for-her.jpg"), alt: "Web banner “for her”: two women in festive wear", x: 74.37, y: 4288.22, w: 519, h: 193.59 },
      { kind: "image", src: raya("mehr-for-him.jpg"), alt: "Web banner “for him”: a group of men in kurtas greeting each other", x: 611.01, y: 4288.22, w: 519.7, h: 193.59 },
      { kind: "image", src: raya("mehr-grid.jpg"), alt: "The Raya Instagram grid in reds and rusts: “an exclusive bride’s maid edit”, “Nazar is real”, “Don’t spill the tea”, and a block-printing stamp", x: 77.53, y: 4503.91, w: 1050.03, h: 800.88 },
      { kind: "image", src: raya("presenting-mehr.jpg"), alt: "Social post “presenting Mehr” over the collection’s cast", x: 77.93, y: 5344.12, w: 326.43, h: 412.84, stack: "half" },
      { kind: "image", src: raya("bridesmaid-edit.jpg"), alt: "Social post “an exclusive bride’s maid edit” over a red embroidered sleeve and gold bangles", x: 712.02, y: 5343.67, w: 414.84, h: 518.17, stack: "half" },
      { kind: "image", src: raya("clothes-rack.jpg"), alt: "A rail of festive garments in a studio", x: 77.93, y: 5778.34, w: 403.22, h: 569.16, stack: "half" },
      { kind: "image", src: raya("mothers-day.jpg"), alt: "A Mother’s Day post: hands holding an old photo of a mother and daughter", x: 865.72, y: 6251.91, w: 209.69, h: 261.92, stack: "half", motion: "deal" },
      { kind: "image", src: raya("mehr-banner.jpg"), alt: "Web banner for the Mehr collection: friends gathered on the floor", x: 520.35, y: 5880.36, w: 601.75, h: 338.79 },
      { kind: "image", src: raya("banno-ki-saheli.jpg"), alt: "A lace-edged card reading “banno ki saheli” on red", x: 569.68, y: 6251.91, w: 254.54, h: 148.48, motion: "deal" },
      { kind: "image", src: raya("mehr-look-1.jpg"), alt: "Mehr lookbook page: an orange kurta, with fabric details", x: 77.93, y: 6365.06, w: 165.74, h: 207.02, stack: "half", motion: "deal" },
      { kind: "image", src: raya("mehr-look-2.jpg"), alt: "Mehr lookbook page: a green blouse and maroon skirt, with fabric details", x: 315.41, y: 6365.06, w: 165.74, h: 207.02, stack: "half", motion: "deal" },
      { kind: "image", src: raya("mehr-look-3.jpg"), alt: "Mehr lookbook page: a blue kurta set, with fabric details", x: 77.57, y: 6582.38, w: 166.45, h: 207.9, stack: "half", motion: "deal" },
      { kind: "image", src: raya("mehr-look-4.jpg"), alt: "Mehr lookbook page: a peach sari, with fabric details", x: 314.74, y: 6581.98, w: 167.08, h: 208.69, stack: "half", motion: "deal" },
      { kind: "image", src: raya("dhol.jpg"), alt: "Hands in gold bangles and rings resting on a dhol", x: 569.68, y: 6551.39, w: 552.42, h: 322.37 },
      { kind: "image", src: raya("block-print.jpg"), alt: "A wooden block stamping a gold floral print onto red cloth", x: 77.93, y: 6904.42, w: 664.85, h: 404.73, stack: "half" },
      { kind: "image", src: raya("bangles.jpg"), alt: "Stacks of red and green glass bangles", x: 770.93, y: 6908.81, w: 351.17, h: 395.96, stack: "half" },

      { kind: "text", role: "label", x: 92.76, baseline: 7378.87, size: 12, lines: ["COLLECTIONS"] },
      { kind: "text", role: "label", x: 92.76, baseline: 7403.67, size: 12, lines: ["About the collection"] },
      { kind: "image", src: raya("dhaaga-website.jpg"), alt: "The Raya website’s festive-season banner: the Dhaaga cast before a patterned hanging", x: 82.84, y: 7449.17, w: 1056.34, h: 615.57 },
      { kind: "text", role: "body", x: 82.84, baseline: 8086.86, size: 21.75, lines: ["website", "graphics"] },
      { kind: "image", src: raya("dhaaga-for-her.jpg"), alt: "Web banner “for her”: friends tying rakhis", x: 85.99, y: 8126.62, w: 510.11, h: 190.38 },
      { kind: "image", src: raya("dhaaga-for-him.jpg"), alt: "Web banner “for him”: two young men laughing", x: 627.86, y: 8126.62, w: 504.76, h: 188.27 },
      { kind: "image", src: raya("dhaaga-grid.jpg"), alt: "The Dhaaga Instagram grid in maroon, olive and cream: stamps, rakhi illustrations, and the collection’s story, vision and mission", x: 86.51, y: 8335.31, w: 1043.38, h: 794.2 },
      { kind: "image", src: raya("dhaaga-couple.jpg"), alt: "Three friends around a plate of sweets, under the Dhaaga wordmark", x: 86.51, y: 9150.28, w: 296.24, h: 419.04, stack: "half" },
      { kind: "image", src: raya("nok-jhok.jpg"), alt: "A maroon card of a rakhi and a sibling photo, addressed “To, Nok-Jhok”", x: 716.8, y: 9153.96, w: 414.84, h: 514.49, stack: "half" },
      { kind: "image", src: raya("rakhi-edit.jpg"), alt: "A folder labelled “the rakhi edit”, holding a photo of a sister applying a tilak and a “New Collection Launch” card", x: 86.51, y: 9611.92, w: 425.82, h: 574.73 },
      { kind: "image", src: raya("dhaaga-banner.jpg"), alt: "Web banner for the Dhaaga collection: the cast before a patterned hanging", x: 528.81, y: 9723.36, w: 601.76, h: 338.79 },
      { kind: "image", src: raya("green-card.jpg"), alt: "An olive card with a woven motif: “Not everything meaningful fits into a pattern.”", x: 578.15, y: 10075.49, w: 222.32, h: 222.32, stack: "half", motion: "deal" },
      { kind: "image", src: raya("raksha-bandhan.jpg"), alt: "An illustration of a sister tying a rakhi on her brother’s wrist, “Inspired by Raksha Bandhan, woven for today.”", x: 836.7, y: 10075.49, w: 291.69, h: 291.7, stack: "half", motion: "deal" },
      { kind: "image", src: raya("dhaaga-look-1.jpg"), alt: "Dhaaga lookbook page: an orange top and olive trousers", x: 86.51, y: 10208.06, w: 165.63, h: 241.18, stack: "half", motion: "deal" },
      { kind: "image", src: raya("dhaaga-look-2.jpg"), alt: "Dhaaga lookbook page: a red kurta and white trousers", x: 316.63, y: 10208.06, w: 165.63, h: 241.18, stack: "half", motion: "deal" },
      { kind: "image", src: raya("dhaaga-look-3.jpg"), alt: "Dhaaga lookbook page: a pale pink dress", x: 86.51, y: 10454.4, w: 165.63, h: 241.18, stack: "half", motion: "deal" },
      { kind: "image", src: raya("dhaaga-look-4.jpg"), alt: "Dhaaga lookbook page: a pink kurta", x: 315.76, y: 10454.4, w: 167.36, h: 243.7, stack: "half", motion: "deal" },
      { kind: "image", src: raya("pattern.jpg"), alt: "The Dhaaga pattern: maroon floral motifs on cream", x: 578.15, y: 10394.39, w: 550.24, h: 322.37 },
      { kind: "image", src: raya("rakhi.jpg"), alt: "A rakhi of twisted threads being tied on a wrist", x: 86.51, y: 10770.69, w: 602.8, h: 366.95 },
      { kind: "image", src: raya("dhaaga-stamp.jpg"), alt: "A maroon card framing a group photo as a postage stamp under the Dhaaga wordmark", x: 758, y: 10768.39, w: 369.25, h: 369.25, motion: "stamp" },

      { kind: "image", src: raya("closing.jpg"), alt: "The Raya logo, “raya by Bhumi Goyanka”, in maroon on sand", x: 0, y: 11168.5, w: 1195.28, h: 429.1, stack: "bleed" },
    ],
  },
  {
    slug: "the-better-made",
    title: "The Better Made",
    folders: ["packaging"],
    cover: { src: betterMade("logo.jpg"), aspectRatio: 328.67 / 246.5 },
    page: { width: 1195.28, height: 6061.34 },
    accent: betterMadeGreen,
    hero: { src: betterMade("hero.jpg"), alt: "A beige food trailer carrying the Better Made logo and the line “label you can believe in”, parked outside a brick building", w: 1195.28, h: 705.97 },
    // Its callouts are set in Outfit, like its headings, so they carry the project's face.
    blocks: [
      { kind: "image", src: betterMade("awning.jpg"), alt: "A green awning with the Better Made logomark in white", x: 228.04, y: 741.97, w: 739.19, h: 576 },

      { kind: "image", src: betterMade("logo.jpg"), alt: "The Better Made logo, three stacked orange bowls beside the wordmark in green, on peach", x: 71.5, y: 1439.24, w: 328.67, h: 246.5, stack: "half" },
      { kind: "image", src: betterMade("logomark.svg"), alt: "The Better Made logomark, three stacked bowls, in orange on peach", x: 800.41, y: 1439.24, w: 323.36, h: 198.79, stack: "half" },
      { kind: "text", role: "label", x: 71.5, baseline: 1707.04, size: 12, lines: ["LOGO"], stack: "half" },
      { kind: "text", role: "label", x: 800.41, baseline: 1661.45, size: 12, lines: ["LOGOMARK"], stack: "half" },
      { kind: "image", src: betterMade("box-open.jpg"), alt: "An open Better Made box of instant organic oats, with a line drawing on its side", x: 438.61, y: 1439.24, w: 320.71, h: 490.35, depth: 0.6 },

      { kind: "text", role: "heading", x: 85.12, baseline: 2096.02, size: 24, lines: ["THOUGHT BEHIND", "THE LOGO"] },
      {
        kind: "text",
        role: "body",
        face: "outfit",
        x: 472.15,
        baseline: 2078.06,
        size: 12,
        lines: [
          "The surahi flows naturally into the",
          "wordmark, making the symbol and",
          "typography feel like one cohesive",
          "mark rather than separate elements.",
        ],
      },
      { kind: "rule", x: 481.75, y: 2134.54, w: 1, h: 44.52 },
      {
        kind: "text",
        role: "body",
        face: "outfit",
        x: 211.55,
        baseline: 2258.12,
        size: 12,
        lines: [
          "The illustrated surahi",
          "acts as the key visual",
          "symbol, immediately",
          "connecting the identity",
          "to Indian culture, craft",
          "and traditional vessels.",
        ],
      },
      { kind: "rule", x: 359.71, y: 2257.62, w: 44.52, h: 1 },
      { kind: "image", src: betterMade("wordmark.svg"), alt: "The Better Made logo in black", x: 434.52, y: 2203.26, w: 300.28, h: 161.69, motion: "write" },
      { kind: "rule", x: 639, y: 2381.27, w: 1, h: 44.52 },
      {
        kind: "text",
        role: "body",
        face: "outfit",
        x: 568.22,
        baseline: 2443.24,
        size: 12,
        lines: [
          "A bold, rounded serif typeface",
          "gives the logo a soft, elegant",
          "and handcrafted character,",
          "balancing tradition with a",
          "contemporary feel.",
        ],
      },
      { kind: "image", src: betterMade("night-sign.jpg"), alt: "A lit sign of line-drawn figures over a shopfront at night", x: 824.8, y: 2050.81, w: 288, h: 423, depth: -0.4 },

      { kind: "text", role: "label", x: 82.5, baseline: 2617.23, size: 12, lines: ["COLOR"] },
      { kind: "image", src: betterMade("palette.svg"), alt: "The colour palette: sand, orange, green and black swatches", x: 76.8, y: 2650.55, w: 429.31, h: 245.66, motion: "deal" },
      { kind: "text", role: "label", x: 625.71, baseline: 2617.23, size: 12, lines: ["TYPOGRAPHY"] },
      {
        kind: "text",
        role: "display",
        x: 625.71,
        baseline: 2676.33,
        size: 48,
        lines: [
          "Primary font",
          { text: "Lilita One", italic: true },
          "",
          "Secondary font",
          { text: "Forta", italic: true },
        ],
      },

      { kind: "slogan", y: 2975, h: 300, text: "label you can believe in" },

      { kind: "text", role: "heading", x: 83.06, baseline: 3067.69, size: 24, lines: ["THOUGHT BEHIND", "THE PACKAGING AND BRANDING"] },
      // Listed in pairs of similar shape, which is how they stack below lg.
      { kind: "image", src: betterMade("box-in-hand.jpg"), alt: "A hand holding the closed box, its lid fastened with a green tab", x: 75.25, y: 3203.33, w: 234, h: 180, stack: "half" },
      { kind: "image", src: betterMade("box-and-sachets.jpg"), alt: "The box of instant organic oats beside a spread of sachets", x: 345.25, y: 3203.33, w: 414, h: 234, stack: "half" },
      { kind: "image", src: betterMade("tote-aisle.jpg"), alt: "A woman carrying a Better Made tote reaches for a box on a cereal aisle shelf", x: 804.25, y: 3203.33, w: 315, h: 405, stack: "half" },
      { kind: "image", src: betterMade("sachet-fan.jpg"), alt: "Sachets of instant organic oats fanned out, from maroon and green to brown and rust", x: 73.17, y: 3535.39, w: 326.44, h: 412.85, stack: "half" },
      { kind: "text", role: "label", x: 414.79, baseline: 3915.39, size: 12, lines: ["INSTANT", "FRESH", "ON THE GO"] },
      { kind: "image", src: betterMade("sachet-plate.jpg"), alt: "A rust sachet of instant organic oats on a gold-rimmed plate", x: 617.71, y: 3651.79, w: 505.72, h: 287.74 },
      { kind: "image", src: betterMade("hanging-totes.jpg"), alt: "Two canvas bags printed with the logomark, hung on a white wall with dried flowers", x: 436.66, y: 4050.76, w: 236.2, h: 176.65, stack: "half" },
      { kind: "image", src: betterMade("box-side.jpg"), alt: "The side of the box: a line-drawn figure walking a cat, and “the better made’s box of instant organic oats”", x: 712.14, y: 4034.88, w: 439.99, h: 331.44, stack: "half" },
      { kind: "image", src: betterMade("box-nutrition.jpg"), alt: "The box turned to show its nutrition table and the line “it’s THAT good”", x: 73.17, y: 4513.39, w: 505.72, h: 361.5 },
      { kind: "image", src: betterMade("sachet-in-bag.jpg"), alt: "Hands slipping a sachet of instant organic oats into a cream shoulder bag", x: 616.39, y: 4513.39, w: 505.72, h: 287.74 },
      { kind: "rule", x: 435.33, y: 4912.35, w: 236.2, h: 176.66, color: betterMadeOlive, motion: "grow" },
      // A cut-out, laid over the olive block.
      { kind: "image", src: betterMade("blocks.webp"), alt: "Wooden blocks with a wrap in the logomark pattern, and two tags carrying the logo and “it’s THAT good”", x: 8.05, y: 4833.58, w: 731.03, h: 475.18, motion: "deal" },
      { kind: "image", src: betterMade("sachets-and-box.jpg"), alt: "Sachets in maroon, brown and rust fanned out in front of the box", x: 74.5, y: 4050.76, w: 326.43, h: 412.85, stack: "half" },
      { kind: "image", src: betterMade("box-flavours.jpg"), alt: "The back of the box, listing what goes into each of its seven flavours", x: 707.26, y: 4912.36, w: 414.85, h: 581.56, stack: "half" },
      { kind: "text", role: "label", x: 619.65, baseline: 5461.06, size: 12, lines: ["With", "seven different", "flavours"] },
      { kind: "image", src: betterMade("sachet-cut.jpg"), alt: "A hand cutting open a sachet on a wooden board", x: 73.17, y: 5565.96, w: 505.72, h: 361.5 },
      { kind: "image", src: betterMade("box-front.jpg"), alt: "The box with sachets beside it, its front reading “it’s THAT good”", x: 616.39, y: 5565.96, w: 505.72, h: 287.74 },
    ],
  },
];

export const projectHref = (project: Project) => `/work/${project.slug}`;
