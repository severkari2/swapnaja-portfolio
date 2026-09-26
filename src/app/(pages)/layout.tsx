import { Footer } from "@/components/Footer";

// Every page except home, which supplies its own <main> and footer. Each page starts with SiteNav, rendered by the page itself so it can add its own
// links (previous / next). The footer closes every page here: main takes the slack, so it
// sits at the bottom of the screen on a short page and after the content on a long one.
export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}
