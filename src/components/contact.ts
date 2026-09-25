// Contact details, shared by Footer and the AboutMe contact tab.

export const email = "swapnajasevekari@gmail.com";
export const phone = "+91-8208763017";

// The space in the file name is kept, so the href encodes it.
export const resumeHref = "/resume/cv%20main.pdf";

export const socials = [
  { label: "ig", name: "Instagram", href: "https://www.instagram.com/swapnajaaaa/" },
  { label: "in", name: "LinkedIn", href: "https://www.linkedin.com/in/swapnajasevekari/" },
];

// Resume and socials leave the site, so they open in a new tab.
export const external = { target: "_blank", rel: "noopener noreferrer" } as const;
