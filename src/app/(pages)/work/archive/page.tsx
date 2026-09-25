import type { Metadata } from "next";
import Link from "next/link";
import { ImageHolder } from "@/components/ImageHolder";
import { SiteNav } from "@/components/SiteNav";
import { archiveEntries, archiveHref } from "./entries";

export const metadata: Metadata = {
  title: "Archive — Swapnaja",
  description: "Archive of past work by Swapnaja.",
};

// archive-section.jpeg, without its "archives" heading (the header says where you are). From
// md up the photos keep the mockup's sizes and margins in --u (one mockup pixel, from the
// work layout) and sit in the page flow; below md they stack.
export default function Archive() {
  return (
    <>
      <SiteNav />
      <div className="px-6 pb-16 pt-10 md:pb-[calc(120*var(--u))] md:pl-[calc(79*var(--u))] md:pr-[calc(36*var(--u))] md:pt-[calc(80*var(--u))]">
        <h1 className="sr-only">archives</h1>

        {/* The mockup's margins are uneven (79 left, 36 right), so they are kept as drawn. */}
        <ul className="grid gap-10 md:grid-cols-3 md:gap-[calc(32*var(--u))]">
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
    </>
  );
}
