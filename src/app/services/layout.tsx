import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { getServicesPageSchema } from "@/lib/schema/pages";

export const metadata: Metadata = buildPageMetadata({
  path: "/services",
  title: "Services",
  description:
    "Editco Media services: website design, AI call agents, WhatsApp automation, CRM systems, SEO/AEO, and growth funnels for clinics and businesses in Hyderabad.",
});

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={getServicesPageSchema()} />
      {children}
    </>
  );
}
