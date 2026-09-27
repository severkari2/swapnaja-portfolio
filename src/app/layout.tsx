import type { Metadata, Viewport } from "next";
import { Montserrat, Outfit, Tinos } from "next/font/google";
import "./globals.css";
import { siteDescription, siteName, siteOpenGraph } from "./site";

// Two families site-wide: Times italic and Montserrat. The only other face is Outfit, which
// the project PDFs set their headings and labels in.

// Body copy, labels, buttons and the home hero. Variable 100-900, and it holds up under the
// wide letterspaced caps this design leans on.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

// Headings, nav links and emphasis are set in Times italic. The system Times is preferred (see
// --font-times); Tinos is the fallback for platforms without it. Not preloaded, since on
// Windows and macOS the browser never needs to fetch it.
const tinos = Tinos({
  variable: "--font-tinos",
  weight: "400",
  style: "italic",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Project pages only (/work/[slug]), so not preloaded: nothing else ever fetches it.
const outfit = Outfit({
  variable: "--font-outfit-face",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Pages set a bare title ("Work", a project's name) and the template adds the name. The icons
// (favicon.ico, icon.svg, apple-icon.png) and the share card (opengraph-image.jpg) are files
// beside this layout. Link previews need their image URLs absolute: on Vercel, Next takes the
// production domain on its own; on any other host, set SITE_URL (https://…) at build time.
export const metadata: Metadata = {
  metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  title: { default: `${siteName} — Graphic Designer`, template: `%s — ${siteName}` },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  keywords: ["graphic designer", "portfolio", "branding", "packaging design", "editorial design", siteName],
  openGraph: siteOpenGraph,
  twitter: { card: "summary_large_image" },
};

// The browser chrome on phones takes the paper colour.
export const viewport: Viewport = { themeColor: "#f7f4ef" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${tinos.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        {/* Pages supply their own <main> and navigation: home draws the full header and
            footer, every other page starts with SiteNav and ends with the (pages) footer. */}
        {children}
      </body>
    </html>
  );
}
