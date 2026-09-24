import type { Metadata } from "next";
import {
  Bodoni_Moda,
  Libre_Baskerville,
  Montserrat,
  Tinos,
} from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "./globals.css";

// Three families, one per role, drawn from three of the pairings on
// public/Font Family.png. Bodoni Moda is the freely licensable stand-in for the sheet's
// Bodoni FLF.

// Display: headings and the wordmark only.
const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  display: "swap",
});

// Prose: drawn for screen reading at text sizes, where Bodoni's hairlines go fragile.
// Static family, so weights are named. It ships no bold italic, hence no `style` array.
const baskerville = Libre_Baskerville({
  variable: "--font-baskerville",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Chrome: nav, labels, buttons. Variable 100-900, and it holds up under the wide
// letterspaced caps this design leans on.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

// Header and footer links are set in Times italic. The system Times is preferred (see
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
      className={`${bodoni.variable} ${baskerville.variable} ${montserrat.variable} ${tinos.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <Header />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
