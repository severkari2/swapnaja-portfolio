"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const views = [
  { href: "/work", label: "works" },
  { href: "/work/archive", label: "archive" },
];

// The "works / archive" pair at the top of /work (Work-hero-section.jpeg). Each is its own
// route; the one you are on stays in ink and the other steps back. The archive draws its
// own heading in place of this row. Sized in --u, which the work layout defines.
//
// The bottom padding is the headroom for the first folder's fan. At 700px and below the
// folders switch to fixed sizes, so it gets a fixed floor there that clears a card and its
// caption.
export function WorkSwitch() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Work"
      className="grid grid-cols-2 pb-[max(4rem,calc(169*var(--u)))] max-[700px]:pb-40 pt-[calc(13*var(--u))] font-sans text-[max(1.75rem,calc(51*var(--u)))] leading-none"
    >
      {views.map((view, i) => {
        const active = pathname === view.href;
        return (
          <Link
            key={view.href}
            href={view.href}
            aria-current={active ? "page" : undefined}
            className={`justify-self-start transition-colors duration-300 ${
              i === 0
                ? "pl-[max(1.5rem,calc(25*var(--u)))]"
                : "pl-[calc(6*var(--u))]"
            } ${active ? "text-ink" : "text-ink/30 hover:text-ink"}`}
          >
            {view.label}
          </Link>
        );
      })}
    </nav>
  );
}
