/** Full-screen menu — matches homepage section heads. */
export const navLinks = [
  { href: "#services", label: "Services" },
  { href: "#industries", label: "Industries" },
  { href: "#case-study", label: "Selected Works" },
  { href: "#why-editco", label: "The Crew" },
  { href: "#process", label: "Process" },
  { href: "#tech", label: "Technologies" },
  { href: "#faq", label: "FAQ" },
  { href: "/refer", label: "Referral" },
  { href: "#contact", label: "Contact" },
] as const;

/** Desktop pill — compact subset of main sections. */
export const desktopNavLinks = [
  { href: "#services", label: "Services" },
  { href: "#case-study", label: "Selected Works" },
  { href: "/refer", label: "Referral" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
] as const;
