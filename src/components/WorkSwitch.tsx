"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const views = [
  { href: "/work", label: "works" },
  { href: "/work/archive", label: "archive" },
];

// The "works / archive" pair at the top of the work pages (Work-hero-section.jpeg). Each is
// its own route; the one you are on stays in ink and the other steps back. Sized in --u,
// which the work layout defines.
export function WorkSwitch() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Work"
      className="grid grid-cols-2 pb-[max(4rem,calc(169*var(--u)))] pt-[calc(13*var(--u))] font-sans text-[max(1.75rem,calc(51*var(--u)))] leading-none"
    >
      {views.map((view, i) => {
        const active = pathname === view.href;
        return (
          <Link
            key={view.href}
            href={view.href}
            // Switching views swaps only what is under this row, so the page holds still.
            scroll={false}
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
