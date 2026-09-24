import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { WorkFolder, type WorkFolderProps } from "@/components/WorkFolder";
import { WorkSwitch } from "@/components/WorkSwitch";

export const metadata: Metadata = {
  title: "Work — Swapnaja",
  description: "Selected graphic design work by Swapnaja.",
};

// The aspect ratios stagger the fan: a card hides behind its folder by exactly its own
// height. They were tuned against the original reference recording; keep them when the
// real projects land.
const folders: WorkFolderProps["items"] = [
  {
    title: "branding",
    href: "#branding",
    color: "var(--burgundy)",
    ink: "var(--paper)",
    images: [
      { src: "/folder-demo/branding-1.svg", aspectRatio: 208 / 156 },
      { src: "/folder-demo/branding-3.svg", aspectRatio: 168 / 224 },
      { src: "/folder-demo/branding-2.svg", aspectRatio: 196 / 196 },
    ],
  },
  // Fills the rest of row one, so "branding" keeps to the left half.
  { blank: true },
  // Row two splits 39/61. The blank cuts this row's tab into the bottom of "branding"
  // and pushes "packaging" in to 540 of the mockup's 1400px.
  { blank: true, span: 0.772 },
  {
    title: "packaging",
    href: "#packaging",
    span: 1.228,
    color: "var(--stone)",
    ink: "var(--burgundy)",
    images: [
      { src: "/folder-demo/photoworks-1.svg", aspectRatio: 232 / 174 },
      { src: "/folder-demo/photoworks-2.svg", aspectRatio: 188 / 235 },
      { src: "/folder-demo/photoworks-3.svg", aspectRatio: 240 / 160 },
    ],
  },
  {
    title: "editorial",
    href: "#editorial",
    span: 2,
    color: "var(--burgundy)",
    ink: "var(--paper)",
    images: [
      { src: "/folder-demo/editorial-1.svg", aspectRatio: 240 / 180 },
      { src: "/folder-demo/editorial-2.svg", aspectRatio: 170 / 226 },
      { src: "/folder-demo/editorial-3.svg", aspectRatio: 216 / 162 },
    ],
  },
];

// In mockup pixels: --u comes from the work layout. The folders' widths are percentages,
// so everything else about them scales with the section to keep the tabs, notches and
// titles in proportion. Below 700px WorkFolder stacks them at fixed sizes.
const u = (px: number) => `calc(${px} * var(--u))`;

export default function Work() {
  return (
    <div className="pb-[calc(74*var(--u))]">
      <h1 className="sr-only">works</h1>
      <WorkSwitch />
      <WorkFolder
        items={folders}
        labels={false}
        rowHeight={u(120)}
        panelHeight={u(156)}
        tabWidth={u(322)}
        photoWidth={u(155)}
        photoGap={u(137)}
        lift={u(12)}
        dimColor="color-mix(in srgb, var(--ink) 5%, var(--paper))"
        dimInk="var(--placeholder)"
        style={
          {
            "--wf-tab-rise": u(36),
            "--wf-pad": u(56),
            "--wf-pad-top": u(40),
            "--wf-title-size": u(63),
          } as CSSProperties
        }
      />
    </div>
  );
}
