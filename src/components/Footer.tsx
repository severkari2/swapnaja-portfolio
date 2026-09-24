// Placeholders until the real handles and contact details land.
const email = "hello@swapnaja.com";

const socials = [
  { label: "ig", name: "Instagram", href: "#" },
  { label: "in", name: "LinkedIn", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-paper">
      <div className="flex items-end justify-between px-6 pb-10 pt-6 sm:px-[7vw] sm:pb-16">
        <a
          href={`mailto:${email}`}
          className="nav-link transition-opacity hover:opacity-60"
        >
          e-mail
        </a>

        <nav aria-label="Social links" className="flex items-end gap-8 sm:gap-14">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.name}
              className="nav-link transition-opacity hover:opacity-60"
            >
              {social.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
