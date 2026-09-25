import { Header } from "./Header";

// The top of every page but home: the site header at its compact height. The page it opens
// can pass its own links as children (previous / next, back to an index); they sit in a thin
// row under the header, right-aligned with "about".
export function SiteNav({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <Header compact />
      {children && (
        <div className="flex justify-end px-6 pb-4 sm:px-[7vw]">{children}</div>
      )}
    </>
  );
}
