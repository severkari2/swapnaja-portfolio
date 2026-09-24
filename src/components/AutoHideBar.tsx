"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FocusEvent } from "react";

// Scroll distance ignored before the direction counts, so trackpad jitter can't flicker a bar.
const JITTER = 6;
// How close to the edge, in px, a mouse must come to call a hidden bar back.
const REVEAL_ZONE = 48;

// A site bar pinned to one edge of the viewport that gets out of the way while reading:
// hidden while scrolling down, back on any scroll up, at the very top or bottom of the page,
// when a link inside it takes keyboard focus, or (mouse only) when the pointer nears its edge.
//
// The spacer keeps the bar's at-rest height in the flow, so hiding or resizing the bar never
// moves the page. The bar exposes data-scrolled (page is off the top) for callers to style,
// e.g. the header's compact height.
//
// On the routes in hiddenOn (and their sub-pages) the bar starts hidden and scrolling never
// brings it back: only the pointer at its edge or keyboard focus does. It also drops its
// spacer there, so the page can use the space the bar would have kept.
export function AutoHideBar({
  edge,
  spacerClassName,
  className = "",
  hiddenOn = [],
  children,
}: {
  edge: "top" | "bottom";
  spacerClassName: string;
  className?: string;
  hiddenOn?: string[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const tucked = hiddenOn.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const [scrolled, setScrolled] = useState(false);
  const [scrolledAway, setScrolledAway] = useState(false);
  const [pointerNear, setPointerNear] = useState(false);
  const [focused, setFocused] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      const atTop = y <= JITTER;
      const atBottom =
        y + window.innerHeight >= document.documentElement.scrollHeight - JITTER;
      setScrolled(!atTop);

      if (atTop || atBottom) {
        setScrolledAway(false);
        lastY = y;
      } else if (Math.abs(y - lastY) > JITTER) {
        setScrolledAway(y > lastY);
        lastY = y;
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Touch screens have no pointer to bring near an edge; scrolling up covers them.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let near = false;
    const set = (next: boolean) => {
      if (next !== near) setPointerNear((near = next));
    };

    function onMove(event: MouseEvent) {
      // Once shown, the whole bar counts as "near", so moving onto its links keeps it up.
      const zone = near ? (bar.current?.offsetHeight ?? REVEAL_ZONE) : REVEAL_ZONE;
      const distance =
        edge === "top" ? event.clientY : window.innerHeight - event.clientY;
      set(distance <= zone);
    }
    const onLeave = () => set(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [edge]);

  const hidden = (tucked || scrolledAway) && !pointerNear && !focused;
  const offscreen = edge === "top" ? "-translate-y-full" : "translate-y-full";

  return (
    <div className={`shrink-0 ${tucked ? "" : spacerClassName}`}>
      <div
        ref={bar}
        data-scrolled={scrolled || undefined}
        onFocus={() => setFocused(true)}
        onBlur={(event: FocusEvent<HTMLDivElement>) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}
        className={`fixed inset-x-0 z-40 transition-[translate,height] duration-300 ease-out motion-reduce:transition-none ${
          edge === "top" ? "top-0" : "bottom-0"
        } ${hidden ? offscreen : ""} ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
