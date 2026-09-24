import type { Metadata } from "next";
import { ImageHolder } from "@/components/ImageHolder";

export const metadata: Metadata = {
  title: "Archive — Swapnaja",
  description: "Archive of past work by Swapnaja.",
};

// Placeholder until the archive hero is specified. It covers the same area as the
// folders on /work, so switching views doesn't move the page.
export default function Archive() {
  return (
    <>
      <h1 className="sr-only">archive</h1>
      <div className="grid gap-[max(1rem,calc(24*var(--u)))] px-[max(1.5rem,calc(25*var(--u)))] sm:grid-cols-3">
        {["archive 01", "archive 02", "archive 03"].map((label) => (
          <ImageHolder
            key={label}
            label={label}
            className="h-[max(12rem,calc(396*var(--u)))]"
          />
        ))}
      </div>
    </>
  );
}
