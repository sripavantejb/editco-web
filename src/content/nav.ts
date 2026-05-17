/** All in-page nav targets (mobile menu). */
export const navLinks = [
  { href: "/#hero", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/#process", label: "Process" },
  { href: "/#case-study", label: "Case Study" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
] as const;

/** Desktop bar — compact subset. */
export const desktopNavLinks = [
  { href: "/services", label: "Services" },
  { href: "/#process", label: "Process" },
  { href: "/#case-study", label: "Case Study" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
] as const;
