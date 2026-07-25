import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Blog — Editco Media Journal",
  description:
    "Insights on AI agents, automation, websites, CRM, and growth systems from Editco Media.",
  alternates: {
    canonical: "/blog",
  },
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
