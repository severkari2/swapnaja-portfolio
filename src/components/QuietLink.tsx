import Link from "next/link";

// Micro-caps link for moving between pages whose mockups draw no navigation (the archive).
// Faint until hovered or focused, so it sits in a margin without joining the composition.
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
