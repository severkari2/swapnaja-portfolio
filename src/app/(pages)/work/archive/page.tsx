import type { Metadata } from "next";
import Link from "next/link";
import { ImageHolder } from "@/components/ImageHolder";
import { QuietLink } from "@/components/QuietLink";
import { archiveEntries, archiveHref } from "./entries";

export const metadata: Metadata = {
  title: "Archive — Swapnaja",
  description: "Archive of past work by Swapnaja.",
};

// archive-section.jpeg. From md up everything sits where the 1400×842 mockup draws it, in
// --u (one mockup pixel, from the work layout); below md it stacks.
export default function Archive() {
  return (
    <div className="relative px-6 pb-16 pt-10 md:h-[calc(842*var(--u))] md:p-0">
      {/* Top right, on the title's baseline: clear of both bars' reveal zones. */}
      <QuietLink
        href="/work"
        className="mb-8 inline-block md:absolute md:right-[calc(46*var(--u))] md:top-[calc(88.7*var(--u))] md:mb-0"
      >
        &larr; works
      </QuietLink>

      <h1 className="font-times text-[2.75rem] italic leading-none md:absolute md:left-[calc(44*var(--u))] md:top-[calc(50*var(--u))] md:text-[calc(60*var(--u))]">
        archives
      </h1>

      {/* The mockup's margins are uneven (79 left, 36 right), so they are kept as drawn. */}
      <ul className="mt-10 grid gap-10 md:absolute md:inset-x-0 md:top-[calc(294*var(--u))] md:mt-0 md:grid-cols-3 md:gap-[calc(32*var(--u))] md:pl-[calc(79*var(--u))] md:pr-[calc(36*var(--u))]">
        {archiveEntries.map((entry) => (
          <li key={entry.slug}>
            <Link href={archiveHref(entry)} className="group block">
              <ImageHolder
                label={`${entry.caption} photo`}
                className="aspect-[407/274] transition-opacity duration-300 group-hover:opacity-80"
              />
              <span className="mt-3 block font-sans text-2xl leading-none md:mt-[calc(15*var(--u))] md:text-[calc(35*var(--u))]">
                {entry.caption}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
