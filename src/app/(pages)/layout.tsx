// Every page except home, which supplies its own <main>. The header and footer come from
// the root layout.
export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-1 flex-col">{children}</main>
  );
}
