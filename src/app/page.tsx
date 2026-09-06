import { SlamVisibilityProvider } from "@/components/motion/SlamVisibilityProvider";
import { HomeSmoothScroll } from "@/components/motion/HomeSmoothScroll";
import { CaseStudySection } from "@/components/sections/CaseStudySection";
import { CalculatorSection } from "@/components/sections/CalculatorSection";
import { ClientsSection } from "@/components/sections/ClientsSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { FooterSection } from "@/components/sections/FooterSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { WhyEditcoSection } from "@/components/sections/WhyEditcoSection";

import { ProblemSection } from "@/components/sections/ProblemSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { SolutionSection } from "@/components/sections/SolutionSection";
import { TechSection } from "@/components/sections/TechSection";

import { WhySection } from "@/components/sections/WhySection";
import { getSiteClientLogos, getSiteCrew, getSiteWorks } from "@/lib/site-content";

export default async function Home() {
  const [clientLogos, works, crewMembers] = await Promise.all([
    getSiteClientLogos(),
    getSiteWorks(),
    getSiteCrew(),
  ]);

  return (
    <SlamVisibilityProvider>
      <HomeSmoothScroll />
      <main id="main" className="relative w-full overflow-x-clip">
        <HeroSection />
        <ProblemSection />
        <ClientsSection logos={clientLogos} />
        <SolutionSection />
        <ServicesSection />
        <WhyEditcoSection />
        <CalculatorSection />
        <CaseStudySection works={works} />
        <WhySection members={crewMembers} />
        <ProcessSection />
        <TechSection />
        <FaqSection />
        <FinalCtaSection />
        <FooterSection />
      </main>
    </SlamVisibilityProvider>
  );
}
