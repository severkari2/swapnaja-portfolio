import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work — Swapnaja",
  description: "Selected graphic design work by Swapnaja.",
};

// The folder fan this page is being built around already exists as
// `@/components/WorkFolder`, together with its placeholder cards in public/folder-demo.
// The config below was tuned against the reference recording — the aspect ratios stagger
// the fan (a card hides behind its folder by exactly its own height) and the `span`
// values reproduce the 39/61 row split — so it is parked here rather than re-derived
// when the real projects land.
//
// import { WorkFolder, type WorkFolderItem } from "@/components/WorkFolder";
//
// const items: WorkFolderItem[] = [
//   {
//     title: "motion",
//     href: "#motion",
//     images: [
//       { src: "/folder-demo/motion-1.svg", aspectRatio: 232 / 174 },
//       { src: "/folder-demo/motion-3.svg", aspectRatio: 174 / 232 },
//       { src: "/folder-demo/motion-2.svg", aspectRatio: 300 / 150 },
//     ],
//   },
//   {
//     title: "branding",
//     href: "#branding",
//     images: [
//       { src: "/folder-demo/branding-1.svg", aspectRatio: 208 / 156 },
//       { src: "/folder-demo/branding-3.svg", aspectRatio: 168 / 224 },
//       { src: "/folder-demo/branding-2.svg", aspectRatio: 196 / 196 },
//     ],
//   },
//   {
//     title: "editorial",
//     href: "#editorial",
//     // The reference splits this row 39/61 rather than in half.
//     span: 0.772,
//     images: [
//       { src: "/folder-demo/editorial-1.svg", aspectRatio: 240 / 180 },
//       { src: "/folder-demo/editorial-2.svg", aspectRatio: 170 / 226 },
//       { src: "/folder-demo/editorial-3.svg", aspectRatio: 216 / 162 },
//     ],
//   },
//   {
//     title: "photoworks",
//     href: "#photoworks",
//     span: 1.228,
//     images: [
//       { src: "/folder-demo/photoworks-1.svg", aspectRatio: 232 / 174 },
//       { src: "/folder-demo/photoworks-2.svg", aspectRatio: 188 / 235 },
//       { src: "/folder-demo/photoworks-3.svg", aspectRatio: 240 / 160 },
//     ],
//   },
//   {
//     title: "illustration",
//     href: "#illustration",
//     // Two columns wide, so it takes the last row on its own.
//     span: 2,
//     images: [
//       { src: "/folder-demo/illustration-3.svg", aspectRatio: 228 / 171 },
//       { src: "/folder-demo/illustration-1.svg", aspectRatio: 176 / 232 },
//       { src: "/folder-demo/illustration-2.svg", aspectRatio: 200 / 200 },
//     ],
//   },
// ];
//
// WorkFolder now reads --font-display / --font-sans by default, so it needs no
// per-instance font overrides:
// <WorkFolder items={items} className="w-full max-w-[1124px]" />

export default function Work() {
  return (
    <section className="mx-auto w-full max-w-[1180px] px-6 py-28 sm:px-10 sm:py-40">
      <p className="label text-ink/60">Selected projects</p>
      <h1 className="mt-8 font-display text-[clamp(3rem,9vw,7rem)] leading-[1.05] tracking-[-0.02em]">
        Work
      </h1>
      <p className="mt-10 font-serif text-[clamp(1.375rem,2vw,2rem)] leading-[1.6] text-ink/60">
        Coming soon.
      </p>
    </section>
  );
}
