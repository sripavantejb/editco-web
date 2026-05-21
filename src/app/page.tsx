import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { JsonLd } from "@/components/seo/JsonLd";
import { SlamVisibilityProvider } from "@/components/motion/SlamVisibilityProvider";
import { HeroSection } from "@/components/sections/HeroSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { SolutionSection } from "@/components/sections/SolutionSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { IndustriesSection } from "@/components/sections/IndustriesSection";
import { WhySection } from "@/components/sections/WhySection";
import { TechSection } from "@/components/sections/TechSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { buildPageMetadata } from "@/lib/seo";
import { getHomePageSchema } from "@/lib/schema/pages";

const ProcessSection = dynamic(
  () =>
    import("@/components/sections/ProcessSection").then((m) => ({
      default: m.ProcessSection,
    })),
  { loading: () => <div className="min-h-[480px] w-full animate-pulse bg-gaude-black" aria-hidden /> }
);

const CaseStudySection = dynamic(
  () =>
    import("@/components/sections/CaseStudySection").then((m) => ({
      default: m.CaseStudySection,
    })),
  { loading: () => <div className="min-h-[520px] w-full animate-pulse bg-gaude-black" aria-hidden /> }
);

const FooterSection = dynamic(
  () =>
    import("@/components/sections/FooterSection").then((m) => ({
      default: m.FooterSection,
    })),
  { loading: () => <div className="min-h-[320px] w-full animate-pulse bg-gaude-black" aria-hidden /> }
);

export const metadata: Metadata = buildPageMetadata({
  path: "/",
  titleAbsolute:
    "Editco Media | AI Automation & Website Development Agency in Hyderabad",
  description:
    "Editco Media is an AI automation agency in Hyderabad. We build smart websites, AI call agents, WhatsApp automations, clinic websites, and SEO/AEO growth systems for businesses.",
});

export default function Home() {
  return (
    <SlamVisibilityProvider>
      <JsonLd data={getHomePageSchema()} />
      <main id="main" className="relative w-full overflow-x-clip">
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <ServicesSection />
        <IndustriesSection />
        <section className="cv-auto">
          <CaseStudySection />
        </section>
        <WhySection />
        <section className="cv-auto">
          <ProcessSection />
        </section>
        <TechSection />
        <FaqSection />
        <FinalCtaSection />
        <section className="cv-auto">
          <FooterSection />
        </section>
      </main>
    </SlamVisibilityProvider>
  );
}
