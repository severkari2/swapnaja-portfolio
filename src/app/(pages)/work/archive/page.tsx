import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Fragment } from "react";
import { ImageHolder } from "@/components/ImageHolder";
import { PrintCollage } from "@/components/PrintCollage";
import { SiteNav } from "@/components/SiteNav";
import { archiveEntries } from "./entries";

export const metadata: Metadata = {
  title: "Archive — Swapnaja",
  description: "Archive of past work by Swapnaja.",
};

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

const collageBox =
  "mt-10 aspect-[603/819] w-(--collage-w) shrink-0 lg:mt-[calc(var(--collage-top)*var(--a))]";

// Every entry in one column, each after its own mockup (archive-section-i-model.jpeg,
// -i-document.jpeg and -behind the scenes.jpeg). From lg up the collage is centred on the
// page, between two equal columns, with the text in the left one, set against the
// collage. From lg up, heights and tops are in --a: --u (one mockup
// pixel, from the work layout) until the 842px frame plus a 40px margin above and below
// (922 in all) would be taller than the screen, then shrinking to fit. So a whole entry,
// collage and all, always fits on one screen. Below lg the text stacks above the collage,
// which is capped to leave room for the text. The header says where you are, so the page
// adds no links of its own.
export default function Archive() {
  return (
    <>
      <SiteNav />
      <h1 className="sr-only">archives</h1>

      <div className="[--a:min(var(--u),calc(100svh/922))]">
        {archiveEntries.map((entry, index) => (
          <section
            key={entry.slug}
            id={entry.slug}
            aria-labelledby={`${entry.slug}-title`}
            className="flex flex-col items-center px-6 pb-16 pt-10 [--collage-w:min(100%,480px,calc((100svh-13rem)*603/819))] lg:h-[calc(922*var(--a))] lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-start lg:gap-x-[calc(48*var(--u))] lg:pb-0 lg:pt-[calc(40*var(--a))] lg:[--collage-w:calc(603*var(--a))]"
            style={
              {
                "--title-top": entry.titleTop,
                "--collage-top": entry.collageTop,
              } as CSSProperties
            }
          >
            {/* From lg up, title and subtitle share one column left of the collage, wide
                enough for a 64px title (it wraps where the page is too narrow to spare
                that), at the site's h1 and paragraph sizes. Those are
                fixed, not scaled with the mockup, so the subtitle follows the title in flow
                rather than at a measured top. The 11.4 turns the title's glyph top from the
                mockup into the top of its line box. */}
            <div className="w-(--collage-w) lg:mt-[calc(var(--title-top)*var(--a)-11.4*var(--u))] lg:w-[19rem] lg:max-w-full lg:justify-self-end">
              <h2
                id={`${entry.slug}-title`}
                className="font-times text-h1 italic leading-[1.1]"
              >
                {lines(entry.title)}
              </h2>
              <p className="mt-2 font-sans text-p leading-[1.4] lg:mt-4">
                {lines(entry.subtitle)}
              </p>
            </div>

            {entry.collage ? (
              <PrintCollage
                items={entry.collage}
                label={`${entry.caption} collage`}
                eager={index === 0}
                className={collageBox}
              />
            ) : (
              <ImageHolder
                label={`${entry.caption} collage`}
                className={collageBox}
              />
            )}
          </section>
        ))}
      </div>
    </>
  );
}
