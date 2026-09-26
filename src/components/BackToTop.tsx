"use client";

// Micro-caps button at the foot of a long page that scrolls back to its top: smoothly, or at
// once under prefers-reduced-motion. Focus moves to `target` (an element with tabIndex -1,
// such as the page's h1), so keyboard and screen reader users land at the top too.
export function BackToTop({ target, className = "" }: { target: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: still ? "instant" : "smooth" });
        document.getElementById(target)?.focus({ preventScroll: true });
      }}
      className={`label cursor-pointer whitespace-nowrap text-ink/40 transition-colors hover:text-ink focus-visible:text-ink [--label-size:12px] ${className}`}
    >
      back to top <span aria-hidden="true">&uarr;</span>
    </button>
  );
}
