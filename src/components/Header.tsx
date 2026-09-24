import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 h-[var(--header-h)] w-full bg-paper">
      {/* Three equal columns rather than justify-between: the middle link stays optically
          centred no matter how wide the wordmark or the right-hand link get. */}
      <div className="grid h-full grid-cols-3 items-center px-6 sm:px-10">
        <Link
          href="/"
          className="font-display text-[26px] tracking-[0.02em] transition-opacity hover:opacity-60 sm:text-[34px]"
        >
          Swapnaja
        </Link>

        {/* Tracking eases off at the larger size so ABOUT cannot overrun its column. */}
        <Link
          href="/work"
          className="label justify-self-center transition-opacity hover:opacity-60 [--label-size:13px] [--label-tracking:0.16em] sm:[--label-size:17px]"
        >
          Work
        </Link>

        <Link
          href="/about"
          className="label justify-self-end transition-opacity hover:opacity-60 [--label-size:13px] [--label-tracking:0.16em] sm:[--label-size:17px]"
        >
          About
        </Link>
      </div>
    </header>
  );
}
