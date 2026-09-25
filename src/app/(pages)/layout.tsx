// Every page except home, which supplies its own <main>. Each page starts with SiteNav,
// rendered by the page itself so it can add its own links (previous / next).
export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-1 flex-col">{children}</main>
  );
}
