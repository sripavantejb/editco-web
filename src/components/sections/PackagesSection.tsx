import { Check } from "lucide-react";
import { packages } from "@/content/landing";
import { SlamBlock } from "@/components/motion/SlamBlock";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionFlow } from "@/lib/stickyStack";

const accents = [
  "bg-gaude-purple text-gaude-black",
  "bg-gaude-green text-gaude-black",
  "bg-white text-gaude-black",
  "bg-gaude-orange text-white",
];

const initRotates = ["rotate-[-2deg]", "rotate-[2deg]", "rotate-[-1deg]", "rotate-[3deg]"];

export function PackagesSection() {
  return (
    <section
      id={packages.id}
      className={`border-b-4 border-gaude-black bg-gaude-purple px-4 py-16 md:px-8 md:py-24 ${sectionFlow}`}
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading 
          title={
            <>
              <span className="text-white">Smart Solutions</span> for Modern Businesses
            </>
          } 
        />

        <div className="mt-4 grid gap-8 lg:grid-cols-2">
          {packages.items.map((pkg, i) => (
            <SlamBlock
              key={pkg.name}
              id={`slam-package-${i}`}
              hoverClasses="hover:-translate-y-2 hover:-translate-x-1"
              initRotate={initRotates[i % initRotates.length]}
              style={{ transitionDelay: `${i * 120}ms` }}
              className={`flex flex-col border-4 border-gaude-black p-6 shadow-[8px_8px_0_0_#0a0a0a] md:p-8 ${accents[i % accents.length]}`}
            >
              <article className="flex h-full flex-col">
                <h3 className="font-archivo text-2xl uppercase leading-none tracking-tighter md:text-3xl">
                  {pkg.name}
                </h3>
                <p className="mt-3 font-inter text-sm font-bold uppercase tracking-wide opacity-90">
                  Best for: {pkg.bestFor}
                </p>
                <p className="mt-4 font-archivo text-xs font-black uppercase tracking-widest opacity-70">
                  Includes
                </p>
                <ul className="mt-2 flex flex-1 flex-col gap-2 font-inter text-sm font-semibold md:text-base">
                  {pkg.includes.map((line) => (
                    <li key={line} className="flex items-start gap-3">
                      <Check className="mt-1 size-4 shrink-0 opacity-60" strokeWidth={3} />
                      {line}
                    </li>
                  ))}
                </ul>
              </article>
            </SlamBlock>
          ))}
        </div>
      </div>
    </section>
  );
}
