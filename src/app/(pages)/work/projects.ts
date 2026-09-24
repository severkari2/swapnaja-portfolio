// Project pages under /work/[slug], rebuilt from the designer's PDF layouts rather than
// embedding the PDFs (Brew for You's is 288MB and Nektar's 302MB; their images come to
// about 2.5MB each).
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
    };

export interface Project {
  slug: string;
  title: string;
  /** The folder on /work whose cards include this project. */
  folder: ProjectFolder;
  /** Its card in that folder. */
  cover: { src: string; aspectRatio: number };
  /** Size of the PDF page the blocks were measured on, in points. */
  page: { width: number; height: number };
  /** Defaults to Outfit. */
  face?: ProjectFace;
  blocks: ProjectBlock[];
}

const brew = (file: string) => `/work/brew-for-you/${file}`;
const nektar = (file: string) => `/work/nektar/${file}`;

// Nektar's own inks: its orange, and the rust it sets its Times italic lines in.
const nektarOrange = "#ee6023";
const nektarRust = "#af4025";

export const projects: Project[] = [
  {
    slug: "brew-for-you",
    title: "Brew For You",
    folder: "branding",
    cover: { src: brew("logo.jpg"), aspectRatio: 563 / 422 },
    page: { width: 1195.28, height: 7786.41 },
    blocks: [
      { kind: "image", src: brew("hero-counter.jpg"), alt: "A barista in a Brew for You T-shirt working behind the café counter", x: 0, y: 0, w: 1195.28, h: 798.97, stack: "bleed" },
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
      { kind: "image", src: brew("bottle-almond-milk.jpg"), alt: "A bottle of almond milk coffee with a Brew for You label, lying on linen", x: 433.85, y: 1491.09, w: 320.72, h: 490.35 },

      { kind: "text", role: "heading", x: 68.59, baseline: 2078.09, size: 24, lines: ["THOUGHT BEHIND", "THE LOGO"] },
      { kind: "image", src: brew("logo-drawing.png"), alt: "The Brew for You wordmark in black", x: 455.47, y: 2186.99, w: 184.87, h: 209.31 },
      { kind: "text", role: "body", x: 455.62, baseline: 2060.16, size: 12, lines: ["High-contrast serif typography", "creates a strong visual presence."] },
      { kind: "rule", x: 465.23, y: 2116.64, w: 1, h: 44.46 },
      { kind: "text", role: "body", x: 195.02, baseline: 2203.84, size: 12, lines: ["The altered letterforms", "give the logo a", "distinctive,", "contemporary", "character."] },
      { kind: "rule", x: 343.18, y: 2203.28, w: 44.46, h: 1 },
      { kind: "rule", x: 622.47, y: 2402.59, w: 1, h: 44.46 },
      { kind: "text", role: "body", x: 551.69, baseline: 2464.6, size: 12, lines: ["The bold type paired with", "the supporting colour", "palette makes the identity", "feel dynamic and", "memorable."] },
      { kind: "image", src: brew("storefront.jpg"), alt: "A customer sipping coffee outside the café, beneath its chalkboard menu", x: 808.28, y: 2031.97, w: 288, h: 423 },

      { kind: "text", role: "label", x: 82.5, baseline: 2646.23, size: 12, lines: ["COLOR"] },
      { kind: "image", src: brew("palette.svg"), alt: "The colour palette: navy, blush, and oxblood pills, each with a cream, brown, or grey starburst", x: 63.66, y: 2668.14, w: 360.25, h: 292.96 },
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

      { kind: "text", role: "heading", x: 83.06, baseline: 3067.69, size: 24, lines: ["THOUGHT BEHIND", "THE PACKAGING AND BRANDING"] },
      { kind: "image", src: brew("espresso.jpg"), alt: "An espresso martini over a chessboard, captioned “Espresso: sharp. simple. focused.”", x: 74.38, y: 3168.79, w: 500.86, h: 361.5 },
      { kind: "image", src: brew("bottles-milk-tea.jpg"), alt: "Two bottles of milk tea with Brew for You labels", x: 612.74, y: 3168.79, w: 505.72, h: 287.74 },
      { kind: "image", src: brew("menu.jpg"), alt: "Hands holding the Brew for You bakery and breakfast menu", x: 69.52, y: 3567.76, w: 326.44, h: 412.84, stack: "half" },
      { kind: "image", src: brew("croissants.jpg"), alt: "The Brew for You logo over a tray of croissants", x: 431.69, y: 3567.76, w: 236.19, h: 176.65, stack: "half" },
      { kind: "image", src: brew("pour.jpg"), alt: "A barista pouring cold brew over ice", x: 703.61, y: 3568.49, w: 414.85, h: 580.83 },

      { kind: "image", src: brew("method-percolator.jpg"), alt: "Brewing-method card: percolator", x: 43.06, y: 4237.75, w: 286.28, h: 226.88, stack: "half" },
      { kind: "image", src: brew("method-french-press.jpg"), alt: "Brewing-method card: french press", x: 403.64, y: 4207.42, w: 368.64, h: 287.54, stack: "half" },
      { kind: "image", src: brew("method-turkish-coffee-pot.jpg"), alt: "Brewing-method card: turkish coffee pot", x: 853.01, y: 4241.5, w: 281.25, h: 219.38, stack: "half" },
      { kind: "image", src: brew("method-chemex.jpg"), alt: "Brewing-method card: chemex", x: 42.6, y: 4564.02, w: 284.5, h: 221.91, stack: "half" },
      { kind: "image", src: brew("method-pour-over.jpg"), alt: "Brewing-method card: pour-over", x: 401.2, y: 4530.97, w: 369.23, h: 288, stack: "half" },
      { kind: "image", src: brew("method-moka-pot.jpg"), alt: "Brewing-method card: moka pot", x: 844.03, y: 4562.47, w: 288.46, h: 225, stack: "half" },

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
    folder: "packaging",
    cover: { src: nektar("logo.svg"), aspectRatio: 328.7 / 246.5 },
    page: { width: 1195.28, height: 6711.83 },
    face: "sans",
    blocks: [
      { kind: "image", src: nektar("hero-can.jpg"), alt: "Hands pulling the tab on a can of Nektar lemon-lime & orange caffeinated water, over a desk of handwritten scent notes", x: 0, y: 0, w: 1195.28, h: 798.97, stack: "bleed" },
      { kind: "image", src: nektar("oranges.jpg"), alt: "Halved oranges, close up", x: 387.54, y: 945.71, w: 421.34, h: 262.76 },
      { kind: "rule", x: 510.1, y: 853, w: 175.1, h: 175.1, color: nektarOrange },
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
      { kind: "image", src: nektar("can-in-orange.jpg"), alt: "A can of Nektar lemon-lime & orange nestled inside a split orange", x: 452.11, y: 1485.4, w: 320.71, h: 483.57 },

      { kind: "text", role: "label", x: 82.5, baseline: 2053.75, size: 12, lines: ["COLOR"] },
      { kind: "image", src: nektar("swatch-orange.svg"), alt: "Colour swatch: orange, with a cream swirl motif", x: 83.1, y: 2077.2, w: 177.7, h: 287.8, stack: "half" },
      { kind: "image", src: nektar("swatch-guava.svg"), alt: "Colour swatch: guava pink, with a deep red swirl motif", x: 280, y: 2077.2, w: 177.7, h: 287.8, stack: "half" },
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

      { kind: "image", src: nektar("refresh-reboot-rework.jpg"), alt: "“refresh. reboot. rework.” in rust italic on orange", x: 68.6, y: 5293.4, w: 232, h: 162.9, stack: "half" },
      { kind: "image", src: nektar("sunburst.jpg"), alt: "A silhouette holding the sun between their hands over the sea", x: 336.29, y: 5293.36, w: 236.11, h: 292.03, stack: "half" },
      { kind: "image", src: nektar("eyes-closed.jpg"), alt: "A young man with his eyes closed, drinking from a can of Nektar pink guava", x: 611.09, y: 5279.6, w: 506.41, h: 305.37 },
      { kind: "image", src: nektar("chessboard.jpg"), alt: "Hands over a drinking-game chessboard of shot glasses", x: 68.56, y: 5615.37, w: 503.84, h: 715.21 },
      { kind: "image", src: nektar("straw.jpg"), alt: "A young man sipping through a straw, seen through a fisheye lens", x: 613.5, y: 5624.18, w: 504, h: 287.74 },
    ],
  },
];

export const projectHref = (project: Project) => `/work/${project.slug}`;
