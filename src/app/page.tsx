import { MagnifyText } from "@/components/MagnifyText";

export default function Home() {
  return (
    // `flex-1` against the flex-column <main>: the hero takes whatever the header and
    // footer leave, so the whole page lands as a single screen.
    <section className="flex flex-1 items-center justify-center px-6">
      <MagnifyText
        text="-hello."
        className="font-sans font-medium tracking-[-0.01em] text-burgundy text-[clamp(4rem,15vw,15rem)]"
      />
    </section>
  );
}
