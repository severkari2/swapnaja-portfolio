// Shared by /work, the project pages (/work/[slug]) and everything under /work/archive.
// Project pages measure their own unit against the same container: one point of their PDF.
//
// --u is one pixel of the 1400px-wide mockups (Work-hero-section.jpeg, archive-section*.jpeg),
// measured against this container so it matches the percentage widths inside it.
export default function WorkLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="@container">
      <div className="[--u:calc(100cqw/1400)]">{children}</div>
    </div>
  );
}
