import { AutoHideBar } from "./AutoHideBar";
import { NavLink } from "./NavLink";

export function Header() {
  return (
    // Full height at the top of the page; off the top it comes back at the compact height.
    // Kept out of the way on the archive and about pages, whose mockups fill the screen from
    // the top edge.
    <AutoHideBar
      edge="top"
      spacerClassName="h-[var(--header-h)]"
      className="h-[var(--header-h)] data-scrolled:h-[var(--header-h-compact)]"
      hiddenOn={["/work/archive", "/about"]}
    >
      <header className="h-full bg-paper">
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
    </AutoHideBar>
  );
}
