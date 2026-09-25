import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Fragment } from "react";
import { Footer } from "@/components/Footer";
import { ImageHolder } from "@/components/ImageHolder";
import { SiteNav } from "@/components/SiteNav";

export const metadata: Metadata = {
  title: "About — Swapnaja",
  description:
    "Swapnaja is a communication designer working across branding, packaging, editorial and creative design.",
};

// The labels around the table (about-second-section.jpeg), each with its hand-set line
// breaks and the top-left of its line box in mockup pixels.
const contributions = [
  { lines: ["no", "communication", "gap"], left: 222, top: 317.1 },
  { lines: ["devil’s", "advocate"], left: 878, top: 289.1 },
  { lines: ["flow", "&", "flexibility"], left: 441, top: 626.1 },
  { lines: ["own", "your", "edit"], left: 896, top: 582.1 },
];

// about-page.jpeg and about-second-section.jpeg: two 1400×842 frames, between the SiteNav
// row and the contact footer. From md up everything sits where the mockups draw it, in --u
// (one mockup pixel); below md each frame stacks.
//
// Tops are line-box tops worked back from the glyph baselines measured off the mockups.
export default function About() {
  return (
    <div className="@container">
      <div className="[--u:calc(100cqw/1400)]">
        <SiteNav />

        {/* The mockup's "about" heading is gone (the header already says where you are), and
            the frame moves up by the 120 mockup pixels it took. */}
        <section className="relative flex flex-col px-6 pb-20 pt-10 md:block md:h-[calc(722*var(--u))] md:p-0">
          <h1 className="sr-only">about</h1>

          {/* The mockup breaks these lines by hand; below md the copy wraps freely. The
              Times words are the same size as the Montserrat around them, and leading-none
              keeps their taller line box from pushing the lines apart. */}
          <p className="font-sans text-[1.625rem] leading-[1.23] md:absolute md:left-[calc(95*var(--u))] md:top-[calc(59.9*var(--u))] md:whitespace-nowrap md:text-[calc(52*var(--u))] md:leading-[calc(64*var(--u))] [&_em]:font-times [&_em]:text-[0.99em] [&_em]:leading-none [&_em]:text-burgundy">
            I&rsquo;m <em>Swapnaja, a Communication Designer</em>{" "}
            <br className="hidden md:block" />
            working across <em>branding, packaging,</em> editorial,{" "}
            <br className="hidden md:block" />
            and creative design. I enjoy <em>turning ideas</em> into{" "}
            <br className="hidden md:block" />
            simple, thoughtful <em>visual stories</em> that connect{" "}
            <br className="hidden md:block" />
            with people.
          </p>

          <ImageHolder
            label="portrait at work"
            className="mt-10 aspect-[473/334] w-full max-w-[480px] self-end md:absolute md:left-[calc(765*var(--u))] md:top-[calc(338*var(--u))] md:mt-0 md:w-[calc(473*var(--u))] md:max-w-none"
          />
        </section>

        <section
          aria-labelledby="contribute"
          className="relative flex flex-col px-6 pb-20 pt-24 md:block md:h-[calc(842*var(--u))] md:p-0"
        >
          {/* "table" is struck through and "team" written above it. Both hang off the
              "table?" span in em, so they follow it when the heading wraps; screen readers
              get the corrected question instead. Set at the site's h2 size, it is centred
              over the table rather than spanning it as in the mockup. Below md the heading
              wraps, and the span's top margin opens a gap above its line for "team". */}
          <h2
            id="contribute"
            className="text-center font-times text-h2 italic leading-none md:absolute md:inset-x-0 md:top-[calc(160*var(--u))] md:whitespace-nowrap md:tracking-[0.016em]"
          >
            what i contribute to the <span className="sr-only">team?</span>
            <span aria-hidden="true" className="relative mt-[0.9em] inline-block md:mt-0">
              table?
              {/* The pen stroke: 4em × 1em from the span's top-left, so it scales with
                  the heading. */}
              <svg
                viewBox="0 0 400 100"
                className="absolute left-0 top-0 h-[1em] w-[4em] overflow-visible"
              >
                <path
                  d="M-7.8 74.7 L298.1 34.3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6.6"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute left-[1.12em] top-[-0.885em] -translate-x-1/2">
                <span className="block font-sans text-[0.75em] font-medium not-italic leading-none text-burgundy">
                  team
                </span>
              </span>
            </span>
          </h2>

          <Image
            src="/about/team-table.svg"
            alt="Pen drawing, seen from above, of a team seated around a long meeting table covered in papers."
            width={531}
            height={270}
            className="mx-auto mt-24 w-full max-w-[531px] md:absolute md:left-[calc(435*var(--u))] md:top-[calc(340*var(--u))] md:mt-0 md:w-[calc(531*var(--u))] md:max-w-none"
          />

          <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-8 md:contents">
            {contributions.map((item) => (
              <li
                key={item.lines.join(" ")}
                className="font-sans text-[clamp(1rem,4.8vw,1.625rem)] leading-[0.8] tracking-[-0.014em] text-burgundy md:absolute md:left-[calc(var(--left)*var(--u))] md:top-[calc(var(--top)*var(--u))] md:text-[calc(37.5*var(--u))] md:leading-[calc(30*var(--u))]"
                style={
                  {
                    "--left": item.left,
                    "--top": item.top,
                  } as CSSProperties
                }
              >
                {item.lines.map((line, i) => (
                  <Fragment key={line}>
                    {i > 0 && (
                      <>
                        {" "}
                        <br />
                      </>
                    )}
                    {line}
                  </Fragment>
                ))}
              </li>
            ))}
          </ul>
        </section>

        {/* Contact, as on home: the one other place it appears. */}
        <Footer />
      </div>
    </div>
  );
}
