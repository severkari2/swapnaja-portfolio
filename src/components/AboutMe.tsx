"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { email, external, phone, resumeHref } from "./contact";

type Section = { heading: string; body: ReactNode };

// Exactly three: the folder is drawn with three tabs, so the tuple refuses any other count.
type Sections = readonly [Section, Section, Section];

// The contact tab's two outlined buttons.
const button =
  "inline-block rounded-[0.85cqw] border border-paper px-[1.5cqw] py-[0.6cqw] font-times text-[max(1.125rem,3.6cqw)] italic leading-none transition-colors hover:bg-paper hover:text-burgundy";

// Edit the copy here, or pass `sections` to override it. <em> is set in Times italic by the
// panel; the <br>s reproduce the mockup's hand-set line breaks from sm: up.
const defaultSections: Sections = [
  {
    heading: "values",
    body: (
      <>
        i value <em>curiosity</em> over certainty,
        <br className="hidden sm:block" /> <em>purpose</em> over decoration, and{" "}
        <em>ideas</em> over <br className="hidden sm:block" />
        trends. I believe good design comes <br className="hidden sm:block" />
        from <em>asking better questions,</em>{" "}
        <br className="hidden sm:block" />
        experimenting, and keeping things <br className="hidden sm:block" />
        simple yet meaningful.
      </>
    ),
  },
  {
    heading: "for whom",
    body: (
      <>
        for <em>people, brands, and ideas</em> that have{" "}
        <br className="hidden sm:block" />a story worth telling.
      </>
    ),
  },
  {
    heading: "contact",
    body: (
      <>
        <p className="text-h2 leading-[1.4]">
          ready to <em>build</em> a brand <br className="hidden sm:block" />
          that feels like <em>you</em>?
        </p>
        <div className="mt-[3.5cqw] flex flex-wrap gap-[2cqw]">
          <a href={`mailto:${email}`} className={button}>
            connect with us
          </a>
          <a href={resumeHref} {...external} className={button}>
            resume
          </a>
        </div>
        <address className="mt-[3.2cqw] flex flex-col items-start not-italic leading-[1.33]">
          <a href={`tel:${phone.replaceAll("-", "")}`} className="transition-opacity hover:opacity-60">
            {phone}
          </a>
          <a href={`mailto:${email}`} className="transition-opacity hover:opacity-60">
            {email}
          </a>
        </address>
      </>
    ),
  },
];

// The tab row, in mockup pixels: a 936-wide card, three 312-wide tabs 76 tall. Each tab
// rises from the card's top edge with a flared foot and a rounded shoulder, and neighbours
// meet in a V at the card line.
const TAB = 312;
const tabPath = (x: number) =>
  `L${x},76 C${x + 22},76 ${x + 26},60 ${x + 34},40 C${x + 44},15 ${x + 52},0 ${x + 76},0` +
  ` L${x + 236},0 C${x + 260},0 ${x + 268},15 ${x + 278},40 C${x + 286},60 ${x + 290},76 ${x + 312},76`;
const folderTabs = `M0,77 ${[0, TAB, TAB * 2].map(tabPath).join(" ")} L936,77 Z`;

// A three-tab index card. Nothing is open at first, as in the mockup; picking a tab brightens
// its heading and shows its copy. Everything is sized in cqw, so the card scales as a whole.
export function AboutMe({
  sections = defaultSections,
  className = "",
}: {
  sections?: Sections;
  className?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();

  // Roving focus (WAI-ARIA tabs): arrows, Home and End move between tabs and open them.
  function onKeyDown(event: KeyboardEvent) {
    const current = active ?? 0;
    const next = {
      ArrowRight: (current + 1) % 3,
      ArrowLeft: (current + 2) % 3,
      Home: 0,
      End: 2,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className={`@container ${className}`}>
      <div className="relative">
        <svg
          viewBox="0 0 936 77"
          aria-hidden="true"
          className="block h-auto w-full fill-burgundy"
        >
          <path d={folderTabs} />
        </svg>

        <div
          role="tablist"
          aria-label="About me"
          onKeyDown={onKeyDown}
          className="absolute inset-0 grid grid-cols-3"
        >
          {sections.map((section, i) => (
            <button
              key={i}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={active === i}
              aria-controls={`${id}-panel-${i}`}
              tabIndex={(active ?? 0) === i ? 0 : -1}
              onClick={() => setActive(i)}
              className={`flex cursor-pointer items-end justify-center font-times text-[max(0.9375rem,3.7cqw)] italic leading-none outline-none transition-colors focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-paper ${
                active === i ? "text-paper" : "text-paper/55 hover:text-paper/85"
              }`}
            >
              {section.heading}
            </button>
          ))}
        </div>
      </div>

      {/* -mt-px overlaps the tab row so no seam shows where the two shapes meet. */}
      <div className="-mt-px flex min-h-[59.8cqw] flex-col justify-end rounded-b-[0.3cqw] bg-burgundy px-[6.2cqw] pb-[6cqw] pt-[8cqw]">
        {sections.map((section, i) => (
          <div
            key={i}
            role="tabpanel"
            id={`${id}-panel-${i}`}
            aria-labelledby={`${id}-tab-${i}`}
            hidden={active !== i}
            className="text-p leading-[1.45] text-paper [&_em]:font-times [&_em]:text-[1.18em] [&_em]:leading-none"
          >
            {section.body}
          </div>
        ))}
      </div>
    </div>
  );
}
