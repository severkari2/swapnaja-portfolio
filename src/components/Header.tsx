import { NavLink } from "./NavLink";

// The site header (Home.png), on every page. It sits in the page flow and scrolls away with
// it. Home shows it at full height, framing the first screen; every other page uses the
// compact height (through SiteNav), so it looks the same but takes less of the screen.
export function Header({ compact = false }: { compact?: boolean }) {
  return (
    <header
      className={`shrink-0 bg-paper ${
        compact ? "h-[var(--header-h-compact)]" : "h-[var(--header-h)]"
      }`}
    >
      {/* Four links spread edge to edge. "works" excludes the archive, which has its own
          link, so only one of the two lights up there. */}
      <nav
        aria-label="Main"
        className="flex h-full items-center justify-between px-6 sm:px-[7vw]"
      >
        <NavLink href="/">home</NavLink>
        <NavLink href="/work" exclude="/work/archive">
          works
        </NavLink>
        <NavLink href="/work/archive">archive</NavLink>
        <NavLink href="/about">about</NavLink>
      </nav>
    </header>
  );
}
