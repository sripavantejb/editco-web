/** Full-screen menu — matches homepage section heads. */
export const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#why-editco", label: "Why Editco" },
  { href: "#case-study", label: "Selected Works" },
  { href: "#crew", label: "The Crew" },
  { href: "#process", label: "Process" },
  { href: "#tech", label: "Technologies" },
  { href: "/blog", label: "Blog" },
  { href: "/careers", label: "Careers" },
  { href: "/refer", label: "Referral" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
] as const;

/** Desktop pill — compact subset of main sections. */
export const desktopNavLinks = [
  { href: "#services", label: "Services" },
  { href: "#why-editco", label: "Why Editco" },
  { href: "#case-study", label: "Selected Works" },
  { href: "/blog", label: "Blog" },
  { href: "/careers", label: "Careers" },
  { href: "/refer", label: "Referral" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
] as const;
