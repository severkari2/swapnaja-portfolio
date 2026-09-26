import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { AboutMe } from "@/components/AboutMe";
import { external, resumeHref } from "@/components/contact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MagnifyText } from "@/components/MagnifyText";

const tools = ["Illustrator", "Photoshop", "InDesign", "Figma", "Procreate"];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* First screen (Home.png): header, hero and footer land together as one screen, the
          hero taking whatever the two bars leave. All three scroll away with the page. */}
      <div className="flex min-h-svh flex-col">
        <Header />
        <section className="flex flex-1 items-center justify-center px-6">
          <MagnifyText
            text="-hello."
            className="font-sans font-medium tracking-[-0.01em] text-burgundy text-[clamp(4rem,15vw,15rem)]"
          />
        </section>
        <Footer />
      </div>

      {/* About teaser (Home-section-2.png). Everything is measured in --u: one pixel of the
          1400px-wide mockup. It grows past 1400px viewports and bottoms out at 1px below,
          so the text never shrinks under its drawn size. */}
      <section
        aria-labelledby="about-teaser"
        className="relative min-h-svh bg-burgundy pb-[calc(192*var(--u))] [--u:max(1px,0.07143vw)]"
      >
        {/* A sunset over wet sand, its apricot sky running down into the burgundy card.
            The 16:9 photo is cropped to a wide band across clouds and horizon. Decorative,
            so it has no alt text. */}
        <div className="absolute inset-x-0 top-0 h-[calc(420*var(--u))]">
          <Image
            src="/home/sunset.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="relative mx-auto flex w-[min(100%_-_3rem,calc(504*var(--u)))] flex-col gap-[calc(4*var(--u))] pt-[calc(221*var(--u))]">
          <div className="bg-burgundy px-[calc(24*var(--u))] pb-[calc(8*var(--u))] pt-[calc(60*var(--u))]">
            <h2
              id="about-teaser"
              className="font-times text-h2 italic leading-none text-paper"
            >
              about
            </h2>

            {/* One face for all the body copy, so the Times italic heading stands apart;
                the emphasised words are set in a heavier weight instead. At the site's
                paragraph size the mockup's hand-set breaks no longer fit, so it wraps. */}
            <p className="mt-[calc(14*var(--u))] text-p leading-[1.4] text-white">
              hello, I&rsquo;m a{" "}
              <em className="font-medium not-italic text-paper">graphic designer</em> with
              an eye for fun and simple style; if I were to describe myself,{" "}
              <em className="font-medium not-italic text-paper">&ldquo;curious&rdquo;</em>{" "}
              would be a fitting word. I&rsquo;m basically on a never-ending quest for{" "}
              <em className="font-medium not-italic text-paper">
                &lsquo;what if?&rsquo; and &lsquo;why not?&rsquo;
              </em>
            </p>

            <p className="mt-[calc(13*var(--u))] text-p leading-[1.4] text-paper">
              {/* Each separator stays glued to the tool before it, so a narrow screen
                  never starts a line with one. The space between tools sits outside the
                  nowrap span, or the whole row would refuse to wrap. */}
              {tools.map((tool, i) => (
                <Fragment key={tool}>
                  <span className="whitespace-nowrap">
                    {tool}
                    {i < tools.length - 1 && " |"}
                  </span>{" "}
                </Fragment>
              ))}
            </p>

            <div className="mt-[calc(10*var(--u))] flex justify-end gap-[calc(20*var(--u))] text-p leading-none text-paper *:underline *:decoration-1 *:underline-offset-[0.15em] *:transition-opacity *:hover:opacity-60">
              <a href={resumeHref} {...external}>
                resume
              </a>
              <Link href="/about">more</Link>
            </div>
          </div>

          {/* A wide crop of a 4:3 photo, held on the face as the width changes. */}
          <div className="relative h-[calc(214*var(--u))]">
            <Image
              src="/home/portrait.jpg"
              alt="Swapnaja smiling in low winter sunlight, in a brown jacket over a black turtleneck."
              fill
              sizes="(min-width: 1400px) 36vw, (min-width: 552px) 504px, calc(100vw - 3rem)"
              className="object-cover object-[60%_25%]"
            />
          </div>
        </div>
      </section>

      {/* The folder card (myself-component-*.jpeg): 936 of the mockup's 1400px, on paper. */}
      <section
        aria-label="About me"
        className="bg-paper px-6 py-[calc(120*var(--u))] [--u:max(1px,0.07143vw)]"
      >
        <AboutMe className="mx-auto w-full max-w-[calc(936*var(--u))]" />
      </section>
    </main>
  );
}
