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
      {/* Three equal columns rather than justify-between: "works" stays optically centred
          no matter how wide the outer links get. */}
      <nav
        aria-label="Main"
        className="grid h-full grid-cols-3 items-center px-6 sm:px-[7vw]"
      >
        <NavLink href="/" className="justify-self-start">
          home
        </NavLink>
        <NavLink href="/work" className="justify-self-center">
          works
        </NavLink>
        <NavLink href="/about" className="justify-self-end">
          about
        </NavLink>
      </nav>
    </header>
  );
}
