import { SlamVisibilityProvider } from "@/components/motion/SlamVisibilityProvider";
import { CaseStudySection } from "@/components/sections/CaseStudySection";
import { ComparisonSection } from "@/components/sections/ComparisonSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { FooterSection } from "@/components/sections/FooterSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { IndustriesSection } from "@/components/sections/IndustriesSection";

import { PositioningSection } from "@/components/sections/PositioningSection";
import { ProblemSection } from "@/components/sections/ProblemSection";
import { ProcessSection } from "@/components/sections/ProcessSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { SolutionSection } from "@/components/sections/SolutionSection";
import { TechSection } from "@/components/sections/TechSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { WhySection } from "@/components/sections/WhySection";

export default function Home() {
  return (
    <SlamVisibilityProvider>
      <main id="main" className="relative w-full overflow-x-clip">
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <ServicesSection />
        <IndustriesSection />
        <CaseStudySection />
        <WhySection />
        <ProcessSection />

        <ComparisonSection />
        <TestimonialsSection />
        <TechSection />
        <FaqSection />
        <FinalCtaSection />
        <FooterSection />
      </main>
    </SlamVisibilityProvider>
  );
}
