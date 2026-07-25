export type ClientLogo = {
  title: string;
  href?: string;
  src?: string;
  alt?: string;
  /** Card surface — match logo file bg so nested boxes disappear */
  card?: "light" | "dark";
  /** Extra scale for logos with heavy built-in padding */
  scale?: number;
};

export const clients = {
  id: "clients" as const,
  heading:
    "Businesses Across Industries Trust Editco Media to Build Systems That Actually Convert.",
  // Ordered light/dark alternating (Sai Preethi, Dentin, KodeClamp stay white)
  logos: [
    {
      title: "Dentin",
      href: "https://www.dentinoralexperts.com/",
      src: "/clients/dentin.png",
      alt: "Dentin Oral Experts",
      card: "light",
      scale: 1.2,
    },
    {
      title: "Build Track",
      href: "https://buildtrack.editcomedia.com/",
      src: "/clients/build-track.png",
      alt: "Build Track",
      card: "dark",
      scale: 1.55,
    },
    {
      title: "Sai Preethi",
      href: "https://www.saipreethiclinic.com/",
      src: "/clients/sai-preethi.png",
      alt: "Dr. Sai Preethi Skin & Aesthetic Clinic",
      card: "light",
      scale: 0.92,
    },
    {
      title: "Medi AI",
      src: "/clients/medi-ai.png",
      alt: "Medi AI",
      card: "dark",
      scale: 1.55,
    },
    {
      title: "KodeClamp",
      src: "/clients/kodeclamp.png",
      alt: "KodeClamp Marketing Technology Solutions",
      card: "light",
      scale: 0.9,
    },
    {
      title: "LumaSwitch",
      src: "/clients/leaf-mark.png",
      alt: "LumaSwitch",
      card: "dark",
      scale: 1.55,
    },
    {
      title: "Easy Move",
      href: "https://easymove-alpha.vercel.app/",
      src: "/clients/easy-move.png",
      alt: "Easy Move",
      card: "dark",
      scale: 1.55,
    },
    {
      title: "Social DNA",
      src: "/clients/social-dna.png",
      alt: "Social DNA",
      card: "dark",
      scale: 1.55,
    },
  ] satisfies ClientLogo[],
};
