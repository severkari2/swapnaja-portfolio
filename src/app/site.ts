import type { Metadata } from "next";

// Who the site is, for page titles and link previews. The root layout sets these; a page that
// sets its own openGraph replaces the whole object, so it spreads siteOpenGraph back in.

export const siteName = "Swapnaja Sevekari";

export const siteDescription =
  "Portfolio of Swapnaja Sevekari, a graphic designer working across branding, packaging and editorial design.";

// No title or description here: Next fills them in from each page's own, so a shared link to
// /about previews as About, not as the home page.
export const siteOpenGraph = {
  type: "website",
  siteName,
  locale: "en_IN",
} satisfies Metadata["openGraph"];
