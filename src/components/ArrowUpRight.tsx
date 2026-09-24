import React from "react";

/**
 * Hairline diagonal arrow used as the separator after each footer social link and as
 * the trailing mark on text buttons. Stroke weight is deliberately below 1.5 so it sits
 * at the same optical weight as the letterspaced micro-caps it follows.
 *
 * Put a `group` on the link to get the nudge on hover.
 */
export function ArrowUpRight({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
      className={`h-[0.7em] w-[0.7em] shrink-0 transition-transform duration-300 group-hover:translate-x-[2px] group-hover:-translate-y-[2px] ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="square"
    >
      <path d="M2.5 9.5 9.5 2.5" />
      <path d="M3.9 2.5H9.5V8.1" />
    </svg>
  );
}
