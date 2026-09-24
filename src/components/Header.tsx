import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 h-[var(--header-h)] w-full bg-paper">
      {/* Three equal columns rather than justify-between: "works" stays optically centred
          no matter how wide the right-hand link gets. The first column is left empty. */}
      <div className="grid h-full grid-cols-3 items-center px-6 sm:px-[7vw]">
        <Link
          href="/work"
          className="nav-link col-start-2 justify-self-center transition-opacity hover:opacity-60"
        >
          works
        </Link>

        <Link
          href="/about"
          className="nav-link justify-self-end transition-opacity hover:opacity-60"
        >
          about
        </Link>
      </div>
    </header>
  );
}
