"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// A header link that turns burgundy on the page it points to. Home matches only "/";
// every other link also matches its sub-pages.
export function NavLink({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active =
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`nav-link transition-opacity hover:opacity-60 ${active ? "text-burgundy" : ""} ${className}`}
    >
      {children}
    </Link>
  );
}
