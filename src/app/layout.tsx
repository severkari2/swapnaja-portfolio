import type { Metadata } from "next";
import { Montserrat, Tinos } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";

// Two families site-wide: Times italic and Montserrat. Nothing else is loaded.

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

export const metadata: Metadata = {
  title: "Swapnaja — Graphic Designer",
  description:
    "Portfolio of Swapnaja, an aspiring graphic designer with an eye for fun and simple style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${tinos.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <Header />
        {/* Pages supply their own <main>; the footer comes from src/app/(pages)/layout.tsx,
            or from the home page's first screen. */}
        {children}
      </body>
    </html>
  );
}
