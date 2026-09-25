import Link from "next/link";

// Micro-caps link for a page's own navigation (previous / next, back to an index), passed
// into SiteNav, which sets them under the header. Faint until hovered or focused, so they
// stay secondary to the header's links.
export function QuietLink({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`label whitespace-nowrap text-ink/40 transition-colors hover:text-ink focus-visible:text-ink [--label-size:12px] ${className}`}
    >
      {children}
    </Link>
  );
}
