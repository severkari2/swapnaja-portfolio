import type { Metadata } from "next";
import { Bodoni_Moda, Libre_Baskerville, Montserrat } from "next/font/google";
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
      className={`${bodoni.variable} ${baskerville.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
