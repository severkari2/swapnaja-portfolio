import { WorkSwitch } from "@/components/WorkSwitch";

// Shared by /work and /work/archive. The switch lives here so it stays put while the view
// under it changes.
//
// --u is one pixel of the 1400px-wide mockup (Work-hero-section.jpeg), measured against
// this section so it matches the percentage widths inside it.
export default function WorkLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="@container">
      <div className="pb-[calc(74*var(--u))] [--u:calc(100cqw/1400)]">
        <WorkSwitch />
        {children}
      </div>
    </section>
  );
}
