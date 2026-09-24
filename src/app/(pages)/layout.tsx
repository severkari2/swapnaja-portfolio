import { Footer } from "@/components/Footer";

// Every page except home: the footer closes the page. Home places it at the bottom of its
// first screen instead (see src/app/page.tsx), so it lives outside this group.
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
