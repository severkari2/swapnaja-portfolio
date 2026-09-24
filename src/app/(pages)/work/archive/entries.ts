export interface ArchiveEntry {
  slug: string;
  /** Caption under its photo on /work/archive. */
  caption: string;
  /** Times italic, one string per line as drawn. */
  title: string[];
  /** Montserrat, one string per line as drawn. */
  subtitle: string[];
  // Where the entry's mockup draws each piece, in pixels of the 1400×842 frame: the top of
  // the tallest letters of the title and of the subtitle, and the collage's top-left
  // corner. The mockups place them slightly differently per page, so these are measured
  // off each one rather than shared.
  titleTop: number;
  subtitleTop: number;
  collageLeft: number;
  collageTop: number;
}

export const archiveEntries: ArchiveEntry[] = [
  {
    slug: "i-model",
    caption: "i model",
    title: ["i model"],
    subtitle: ["off the Design Board"],
    titleTop: 80,
    subtitleTop: 128,
    collageLeft: 365,
    collageTop: 9,
  },
  {
    slug: "i-document",
    caption: "i document",
    title: ["i document"],
    subtitle: ["another way I express,", "create, and tell stories."],
    titleTop: 90,
    subtitleTop: 143,
    collageLeft: 359,
    collageTop: 9,
  },
  {
    slug: "behind-the-scenes",
    caption: "behind the scenes",
    title: ["behind", "the scenes"],
    subtitle: ["the everything", "in between"],
    titleTop: 59,
    subtitleTop: 175,
    collageLeft: 331,
    collageTop: 11,
  },
];

export const archiveHref = (entry: ArchiveEntry) => `/work/archive/${entry.slug}`;
