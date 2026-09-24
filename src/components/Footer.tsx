import { ArrowUpRight } from "./ArrowUpRight";

// Placeholders until the real handles and contact details land.
const socials = [
  { label: "Linkedin", href: "#" },
  { label: "Twitter", href: "#" },
  { label: "Instagram", href: "#" },
];

const email = "hello@swapnaja.com";
const phone = "+91 98765 43210";

export function Footer() {
  return (
    <footer className="border-t border-rule bg-paper">
      <div className="flex flex-col gap-10 px-6 py-16 sm:flex-row sm:items-end sm:justify-between sm:px-10">
        {/* One line, wide gaps — the arrow reads as the separator between handles. */}
        <nav
          aria-label="Social links"
          className="flex flex-wrap items-center gap-x-8 gap-y-5 sm:gap-x-16"
        >
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              className="label group inline-flex items-center gap-2 transition-opacity hover:opacity-60"
            >
              {social.label}
              <ArrowUpRight />
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-4 sm:items-end">
          <a
            href={`mailto:${email}`}
            className="label transition-opacity hover:opacity-60"
          >
            {email}
          </a>
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="label transition-opacity hover:opacity-60"
          >
            {phone}
          </a>
        </div>
      </div>
    </footer>
  );
}
