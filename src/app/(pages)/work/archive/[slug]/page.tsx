import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { ImageHolder } from "@/components/ImageHolder";
import { QuietLink } from "@/components/QuietLink";
import { SiteNav } from "@/components/SiteNav";
import { archiveEntries, archiveHref } from "../entries";

// Only the entries listed; anything else under /work/archive is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return archiveEntries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata(
  props: PageProps<"/work/archive/[slug]">
): Promise<Metadata> {
  const { slug } = await props.params;
  const entry = archiveEntries.find((e) => e.slug === slug);
  return entry ? { title: `${entry.caption} — Archive — Swapnaja` } : {};
}

// archive-section-i-model.jpeg, -i-document.jpeg and -behind the scenes.jpeg: one layout,
// with each entry's measured positions passed in as custom properties. From lg up it
// matches the 1400×842 mockups in --u (one mockup pixel, from the work layout); below lg
// the text stacks above the collage. The frame starts below the SiteNav row, which carries
// the entry's own links: back to the archive and on to the next entry.
export default async function ArchiveEntryPage(
  props: PageProps<"/work/archive/[slug]">
) {
  const { slug } = await props.params;
  const index = archiveEntries.findIndex((e) => e.slug === slug);
  if (index < 0) notFound();

  const entry = archiveEntries[index];
  const next = archiveEntries[(index + 1) % archiveEntries.length];

  // The mockups break these lines by hand; below lg they wrap freely.
  const lines = (text: string[]) =>
    text.map((line, i) => (
      <Fragment key={line}>
        {i > 0 && (
          <>
            {" "}
            <br className="hidden lg:block" />
          </>
        )}
        {line}
      </Fragment>
    ));

  return (
    <>
      <SiteNav>
        <nav aria-label="Archive" className="flex gap-6 sm:gap-8">
          <QuietLink href="/work/archive">&larr; archives</QuietLink>
          <QuietLink href={archiveHref(next)}>
            next<span className="hidden sm:inline">: {next.caption}</span>{" "}&rarr;
          </QuietLink>
        </nav>
      </SiteNav>

      <div
        className="relative flex flex-col px-6 pb-16 pt-10 lg:block lg:h-[calc(842*var(--u))] lg:p-0"
        style={
          {
            "--title-top": entry.titleTop,
            "--collage-left": entry.collageLeft,
            "--collage-top": entry.collageTop,
            // Where the mockup puts the collage, unless that leaves the text column (45
            // mockup px in, 32 short of the collage) narrower than a 64px title needs. Then
            // the collage moves right, into the mockup's empty space.
            "--collage-x":
              "max(calc(var(--collage-left) * var(--u)), calc(77 * var(--u) + 19rem))",
          } as CSSProperties
        }
      >
        {/* From lg up, title and subtitle share one column left of the collage, at the
            site's h1 and paragraph sizes. Those are fixed, not scaled with the mockup, so
            the subtitle follows the title in flow rather than at a measured top. The
            offset turns the title's glyph top from the mockup into the top of its line
            box. */}
        <div className="lg:absolute lg:left-[calc(45*var(--u))] lg:top-[calc((var(--title-top)-11.4)*var(--u))] lg:w-[calc(var(--collage-x)-77*var(--u))]">
          <h1 className="font-times text-h1 italic leading-[1.1]">
            {lines(entry.title)}
          </h1>
          <p className="mt-2 font-sans text-p leading-[1.4] lg:mt-4">
            {lines(entry.subtitle)}
          </p>
        </div>

        <ImageHolder
          label={`${entry.caption} collage`}
          className="mt-10 aspect-[603/819] w-full max-w-[480px] lg:absolute lg:max-w-none lg:left-(--collage-x) lg:top-[calc(var(--collage-top)*var(--u))] lg:mt-0 lg:w-[calc(603*var(--u))]"
        />
      </div>
    </>
  );
}
