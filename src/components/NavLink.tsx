"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const within = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

// A header link that turns burgundy on the page it points to. Home matches only "/";
// every other link also matches its sub-pages, except those under `exclude`.
export function NavLink({
  href,
  exclude,
  className = "",
  children,
}: {
  href: string;
  exclude?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active =
    href === "/"
      ? pathname === "/"
      : within(pathname, href) && !(exclude && within(pathname, exclude));

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
