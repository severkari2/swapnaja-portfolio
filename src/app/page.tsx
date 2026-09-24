import Link from "next/link";
import { Footer } from "@/components/Footer";
import { ImageHolder } from "@/components/ImageHolder";
import { MagnifyText } from "@/components/MagnifyText";

const tools = ["Illustrator", "Photoshop", "InDesign", "Figma", "Procreate"];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      {/* First screen: the hero takes whatever the header and footer leave, so the three
          land together as one screen (Home.png). */}
      <div className="flex min-h-[calc(100svh-var(--header-h))] flex-col">
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
        <ImageHolder
          label="landscape photo"
          className="absolute inset-x-0 top-0 h-[calc(420*var(--u))]"
        />

        <div className="relative mx-auto flex w-[min(100%_-_3rem,calc(504*var(--u)))] flex-col gap-[calc(4*var(--u))] pt-[calc(221*var(--u))]">
          <div className="bg-burgundy px-[calc(24*var(--u))] pb-[calc(8*var(--u))] pt-[calc(60*var(--u))]">
            <h2
              id="about-teaser"
              className="font-times text-[calc(17*var(--u))] italic leading-none text-paper"
            >
              about
            </h2>

            {/* The mockup breaks these lines by hand; below sm the copy wraps freely. */}
            <p className="mt-[calc(8*var(--u))] text-[calc(12*var(--u))] leading-[1.22] text-white">
              hello, I&rsquo;m a{" "}
              <em className="font-times text-paper">graphic designer</em> with
              an eye for fun <br className="hidden sm:block" />
              and simple style; if I were to describe myself,{" "}
              <em className="font-times text-paper">&ldquo;curious&rdquo;</em>{" "}
              would <br className="hidden sm:block" />
              be a fitting word. I&rsquo;m basically on a never-ending{" "}
              <br className="hidden sm:block" />
              quest for{" "}
              <em className="font-times text-paper">
                &lsquo;what if?&rsquo; and &lsquo;why not?&rsquo;
              </em>
            </p>

            <p className="mt-[calc(13*var(--u))] font-times text-[calc(17*var(--u))] italic leading-none text-paper">
              {/* Each separator stays glued to the tool before it, so a narrow screen
                  never starts a line with one. */}
              {tools.map((tool, i) => (
                <span key={tool} className="whitespace-nowrap">
                  {tool}
                  {i < tools.length - 1 && " |"}{" "}
                </span>
              ))}
            </p>

            <Link
              href="/about"
              className="ml-auto mt-[calc(10*var(--u))] block w-fit font-times text-[calc(17*var(--u))] italic leading-none text-paper underline decoration-1 underline-offset-[0.15em] transition-opacity hover:opacity-60"
            >
              more
            </Link>
          </div>

          <ImageHolder label="portrait" className="h-[calc(214*var(--u))]" />
        </div>
      </section>
    </main>
  );
}
