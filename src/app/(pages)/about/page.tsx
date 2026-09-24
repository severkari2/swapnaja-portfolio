import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Swapnaja",
  description:
    "About Swapnaja, an aspiring graphic designer with an eye for fun and simple style.",
};

export default function About() {
  return (
    <section className="mx-auto w-full max-w-[1180px] px-6 py-28 sm:px-10 sm:py-40">
      <p className="label text-ink/60">Who am I?</p>
      <h1 className="mt-8 font-times text-[clamp(3rem,9vw,7rem)] italic leading-[1.05]">
        About
      </h1>
      <p className="mt-10 font-sans text-[clamp(1.125rem,1.8vw,1.75rem)] leading-[1.6] text-ink/60">
        Coming soon.
      </p>
    </section>
  );
}
