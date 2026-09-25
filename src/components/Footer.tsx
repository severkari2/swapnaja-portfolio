import { email, external, resumeHref, socials } from "./contact";

const link = "nav-link transition-opacity hover:opacity-60";

// The contact bar (Home.png). It sits in the page flow: on home it closes the first screen,
// and /about ends with it.
export function Footer() {
  return (
    <footer className="flex h-[var(--footer-h)] shrink-0 items-end justify-between bg-paper px-6 pb-10 sm:px-[7vw] sm:pb-16">
      <div className="flex items-end gap-8 sm:gap-14">
        <a href={`mailto:${email}`} className={link}>
          e-mail
        </a>
        <a href={resumeHref} {...external} className={link}>
          resume
        </a>
      </div>

      <nav aria-label="Social links" className="flex items-end gap-8 sm:gap-14">
        {socials.map((social) => (
          <a
            key={social.label}
            href={social.href}
            {...external}
            aria-label={social.name}
            className={link}
          >
            {social.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}
