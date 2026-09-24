import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { ImageHolder } from "@/components/ImageHolder";
import { QuietLink } from "@/components/QuietLink";
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
// the text stacks above the collage.
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
    <div
      className="relative flex flex-col px-6 pb-16 pt-10 lg:block lg:h-[calc(842*var(--u))] lg:p-0"
      style={
        {
          "--title-top": entry.titleTop,
          "--subtitle-top": entry.subtitleTop,
          "--collage-left": entry.collageLeft,
          "--collage-top": entry.collageTop,
        } as CSSProperties
      }
    >
      {/* Top right, on the title's baseline: the one empty corner that is clear of both
          bars' reveal zones, so reaching for a link never pulls a bar over it. */}
      <nav
        aria-label="Archive"
        className="mb-10 flex justify-between gap-6 lg:absolute lg:right-[calc(46*var(--u))] lg:top-[calc((var(--title-top)+21.5)*var(--u))] lg:mb-0 lg:flex-col lg:items-end lg:gap-[calc(16*var(--u))] xl:flex-row xl:gap-[calc(40*var(--u))]"
      >
        <QuietLink href="/work/archive">&larr; archives</QuietLink>
        <QuietLink href={archiveHref(next)}>
          next<span className="hidden sm:inline">: {next.caption}</span> &rarr;
        </QuietLink>
      </nav>

      {/* The offsets turn each glyph top from the mockup into the top of its line box. */}
      <h1 className="font-times text-[2.75rem] italic leading-[1.247] lg:absolute lg:left-[calc(45*var(--u))] lg:top-[calc((var(--title-top)-11.4)*var(--u))] lg:text-[calc(46.5*var(--u))]">
        {lines(entry.title)}
      </h1>
      <p className="mt-2 font-sans text-lg leading-[1.2] lg:absolute lg:left-[calc(45*var(--u))] lg:top-[calc((var(--subtitle-top)-5.4)*var(--u))] lg:mt-0 lg:text-[calc(28.3*var(--u))]">
        {lines(entry.subtitle)}
      </p>

      <ImageHolder
        label={`${entry.caption} collage`}
        className="mt-10 aspect-[603/819] w-full max-w-[480px] lg:absolute lg:max-w-none lg:left-[calc(var(--collage-left)*var(--u))] lg:top-[calc(var(--collage-top)*var(--u))] lg:mt-0 lg:w-[calc(603*var(--u))]"
      />
    </div>
  );
}
