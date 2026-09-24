import Link from "next/link";
import { MagnifyText } from "@/components/MagnifyText";
import { ArrowUpRight } from "@/components/ArrowUpRight";

export default function Home() {
  return (
    <>
      {/* Fills what is left of the viewport under the sticky header. */}
      <section className="flex min-h-[calc(100svh-var(--header-h))] flex-col items-center justify-center gap-12 bg-burgundy px-6">
        <MagnifyText
          text="-hello."
          backgroundColor="#74070E"
          className="font-display font-normal tracking-[-0.02em] text-white text-[clamp(4rem,14vw,13rem)]"
        />
        <p className="label text-center text-white/70 [--label-tracking:0.3em]">
          Swapnaja · Graphic Designer
        </p>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-6 py-28 sm:px-10 sm:py-40">
        {/* Heading column against a wider prose column — the asymmetric split is what
            makes the section read as editorial rather than as a landing page. */}
        <div className="grid gap-8 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-20">
          {/* Didone capitals, roughly double the answer's size: the question has to
              visibly govern the paragraph beside it. */}
          <h2 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.05] tracking-[0.02em]">
            WHO AM I?
          </h2>

          <div>
            <p className="max-w-[60ch] font-serif text-[clamp(1.125rem,1.8vw,1.75rem)] leading-[1.6]">
              Hello, I&rsquo;m an aspiring graphic designer with an eye for fun
              and simple style; if I were to describe myself,
              &ldquo;curious&rdquo; would be a fitting word. My inquisitivity
              keeps me obsessed with design&mdash;I&rsquo;m basically on a
              never-ending quest for &lsquo;what if?&rsquo; and &lsquo;why
              not?&rsquo;
            </p>

            <Link
              href="/about"
              className="label group mt-14 inline-flex items-center gap-3 border-b border-ink pb-2 transition-opacity hover:opacity-60"
            >
              More about me
              <ArrowUpRight />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
