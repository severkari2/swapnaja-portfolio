import { WorkFolder, type WorkFolderItem } from "@/components/WorkFolder";
import { MagnifyText } from "@/components/MagnifyText";
// Aspect ratios come from the placeholder SVGs in public/folder-demo. They are
// deliberately mixed: a card hides behind the folder by exactly its own height, so
// varying the ratio is what staggers the fan. The tallest card sits in the middle of
// each folder, which is the arc the reference recording makes.
const items: WorkFolderItem[] = [
  {
    title: "motion",
    href: "#motion",
    images: [
      { src: "/folder-demo/motion-1.svg", aspectRatio: 232 / 174 },
      { src: "/folder-demo/motion-3.svg", aspectRatio: 174 / 232 },
      { src: "/folder-demo/motion-2.svg", aspectRatio: 300 / 150 },
    ],
  },
  {
    title: "branding",
    href: "#branding",
    images: [
      { src: "/folder-demo/branding-1.svg", aspectRatio: 208 / 156 },
      { src: "/folder-demo/branding-3.svg", aspectRatio: 168 / 224 },
      { src: "/folder-demo/branding-2.svg", aspectRatio: 196 / 196 },
    ],
  },
  {
    title: "editorial",
    href: "#editorial",
    // The reference splits this row 39/61 rather than in half.
    span: 0.772,
    images: [
      { src: "/folder-demo/editorial-1.svg", aspectRatio: 240 / 180 },
      { src: "/folder-demo/editorial-2.svg", aspectRatio: 170 / 226 },
      { src: "/folder-demo/editorial-3.svg", aspectRatio: 216 / 162 },
    ],
  },
  {
    title: "photoworks",
    href: "#photoworks",
    span: 1.228,
    images: [
      { src: "/folder-demo/photoworks-1.svg", aspectRatio: 232 / 174 },
      { src: "/folder-demo/photoworks-2.svg", aspectRatio: 188 / 235 },
      { src: "/folder-demo/photoworks-3.svg", aspectRatio: 240 / 160 },
    ],
  },
  {
    title: "illustration",
    href: "#illustration",
    // Two columns wide, so it takes the last row on its own.
    span: 2,
    images: [
      { src: "/folder-demo/illustration-3.svg", aspectRatio: 228 / 171 },
      { src: "/folder-demo/illustration-1.svg", aspectRatio: 176 / 232 },
      { src: "/folder-demo/illustration-2.svg", aspectRatio: 200 / 200 },
    ],
  },
];

export default function Home() {
  return (
    // overflow-x-clip, not overflow-hidden: cards can overhang the sides on narrow
    // viewports, but clipping the top would cut the fan off.
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white">
      {/* Navigation */}
      <nav className="absolute top-0 z-10 flex w-full items-center justify-between px-8 py-5 text-black">
        <span className="text-lg font-medium tracking-tight">LP</span>
        <span className="text-sm">works</span>
        <span className="text-sm">about</span>
      </nav>

      <section className="flex min-h-screen w-full items-center justify-center bg-[#D2042D]">
        <MagnifyText 
          text="-hello." 
          className="text-[12vw] font-bold text-black tracking-tighter"
        />
      </section>

      {/* The fan reaches roughly two card-widths above the folders, so the stack sits
          low in the viewport to leave it room. */}
      <section className="flex min-h-screen flex-1 items-end justify-center px-4 py-32 bg-white">
        <WorkFolder
          items={items}
          className="w-full max-w-[1124px]"
          style={
            {
              "--wf-font-title": "var(--font-playfair)",
              "--wf-font-label": "var(--font-geist-mono)",
            } as React.CSSProperties
          }
        />
      </section>
    </div>
  );
}
