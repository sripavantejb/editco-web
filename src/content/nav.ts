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
  { href: "/sales/login/employee", label: "Staff" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
] as const;

/** Desktop pill — compact subset of main sections. */
export const desktopNavLinks = [
  { href: "#services", label: "Services", priority: "high" },
  { href: "#why-editco", label: "Why Editco", priority: "low" },
  { href: "#case-study", label: "Selected Works", priority: "med" },
  { href: "/blog", label: "Blog", priority: "med" },
  { href: "/careers", label: "Careers", priority: "high" },
  { href: "/refer", label: "Referral", priority: "high" },
  { href: "#faq", label: "FAQ", priority: "low" },
  { href: "#contact", label: "Contact", priority: "high" },
] as const;
