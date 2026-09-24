import { NavLink } from "./NavLink";

export function Header() {
  return (
    // Not sticky: the home page's second section is a full-bleed photo that the mockup
    // shows with no bar over it.
    <header className="h-[var(--header-h)] w-full bg-paper">
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
