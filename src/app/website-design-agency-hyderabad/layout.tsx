import { websiteDesignHyderabad } from "@/content/seo-landing-pages";
import { JsonLd } from "@/components/seo/JsonLd";
import { seoLandingMetadata } from "@/lib/seo-landing-metadata";
import { getSeoLandingPageSchema } from "@/lib/schema/pages";

export const metadata = seoLandingMetadata(websiteDesignHyderabad);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={getSeoLandingPageSchema(websiteDesignHyderabad)} />
      {children}
    </>
  );
}
