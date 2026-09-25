export interface ArchiveEntry {
  slug: string;
  /** Plain name, used to label its collage. */
  caption: string;
  /** Times italic, one string per line as drawn. */
  title: string[];
  /** Montserrat, one string per line as drawn. */
  subtitle: string[];
  // Where the entry's mockup draws each piece, in pixels down the 1400×842 frame: the top of
  // the title's tallest letters, and the collage's top edge. The mockups place them slightly
  // differently per page, so these are measured off each one rather than shared. The
  // subtitle follows the title in flow; across, every entry is centred the same way.
  titleTop: number;
  collageTop: number;
}

export const archiveEntries: ArchiveEntry[] = [
  {
    slug: "i-model",
    caption: "i model",
    title: ["i model"],
    subtitle: ["off the Design Board"],
    titleTop: 80,
    collageTop: 9,
  },
  {
    slug: "i-document",
    caption: "i document",
    title: ["i document"],
    subtitle: ["another way I express,", "create, and tell stories."],
    titleTop: 90,
    collageTop: 9,
  },
  {
    slug: "behind-the-scenes",
    caption: "behind the scenes",
    title: ["behind", "the scenes"],
    subtitle: ["the everything", "in between"],
    titleTop: 59,
    collageTop: 11,
  },
];
