import type { CollageItem } from "@/components/PrintCollage";

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
  /** The photos (and videos) for its `PrintCollage`, in the order the collage lays them
   *  down: 14 to a pass. Without them the entry shows a placeholder. */
  collage?: CollageItem[];
}

export const archiveEntries: ArchiveEntry[] = [
  {
    slug: "i-model",
    caption: "i model",
    title: ["i model"],
    subtitle: ["off the Design Board"],
    titleTop: 80,
    collageTop: 9,
    collage: Array.from({ length: 14 }, (_, i) => ({
      src: `/archive/i-model/${String(i + 1).padStart(2, "0")}.jpg`,
    })),
  },
  {
    slug: "i-document",
    caption: "i document",
    title: ["i document"],
    subtitle: ["another way I express,", "create, and tell stories."],
    titleTop: 90,
    collageTop: 9,
    // 39 items: three passes, the last borrowing three prints from the first.
    collage: [
      { src: "/archive/i-document/01.jpg" },
      { src: "/archive/i-document/02.jpg" },
      { src: "/archive/i-document/03.jpg" },
      { src: "/archive/i-document/04.jpg", landscape: true },
      { src: "/archive/i-document/05.jpg" },
      { src: "/archive/i-document/06.jpg" },
      { src: "/archive/i-document/07.jpg" },
      { src: "/archive/i-document/08.jpg", landscape: true },
      { src: "/archive/i-document/09.jpg" },
      { src: "/archive/i-document/10.jpg" },
      { src: "/archive/i-document/11.jpg", landscape: true },
      { src: "/archive/i-document/12.jpg" },
      { src: "/archive/i-document/13.jpg", landscape: true },
      { src: "/archive/i-document/14.jpg" },
      { src: "/archive/i-document/15.jpg" },
      { src: "/archive/i-document/16.jpg", landscape: true },
      { src: "/archive/i-document/17.jpg" },
      { src: "/archive/i-document/18.jpg" },
      { src: "/archive/i-document/19.jpg" },
      { src: "/archive/i-document/20.jpg", landscape: true },
      { src: "/archive/i-document/21.jpg" },
      { src: "/archive/i-document/22.jpg" },
      { src: "/archive/i-document/23.jpg" },
      { src: "/archive/i-document/24.jpg" },
      { src: "/archive/i-document/25.jpg" },
      { src: "/archive/i-document/26.jpg", landscape: true },
      { src: "/archive/i-document/27.jpg" },
      // Baked from IMG_6666.MOV: every 5th frame at 5fps, each nudged and exposed a
      // hair differently, so it plays as stop motion.
      {
        src: "/archive/i-document/valley.jpg",
        video: "/archive/i-document/valley.mp4",
        landscape: true,
      },
      { src: "/archive/i-document/28.jpg" },
      { src: "/archive/i-document/29.jpg" },
      { src: "/archive/i-document/30.jpg" },
      { src: "/archive/i-document/31.jpg" },
      { src: "/archive/i-document/32.jpg" },
      { src: "/archive/i-document/33.jpg", landscape: true },
      { src: "/archive/i-document/34.jpg" },
      { src: "/archive/i-document/35.jpg", landscape: true },
      { src: "/archive/i-document/36.jpg" },
      { src: "/archive/i-document/37.jpg" },
      { src: "/archive/i-document/38.jpg", landscape: true },
    ],
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
