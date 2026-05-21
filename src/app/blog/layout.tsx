import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildPageMetadata } from "@/lib/seo";
import { getBlogIndexSchema } from "@/lib/schema/pages";

export const metadata: Metadata = buildPageMetadata({
  path: "/blog",
  title: "Blog",
  description:
    "Editco Media blog — guides on AI call agents, automation, websites, SEO/AEO, and growth systems for business owners in Hyderabad and beyond.",
});

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={getBlogIndexSchema()} />
      {children}
    </>
  );
}
