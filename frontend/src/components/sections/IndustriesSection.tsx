import { industries } from "@/content/landing";
import { SlamBlock } from "@/components/motion/SlamBlock";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionFlow } from "@/lib/stickyStack";

const initRotates = [
  "rotate-[-2deg]",
  "rotate-[2deg]",
  "rotate-[-1deg]",
  "rotate-[3deg]",
  "rotate-[-3deg]",
  "rotate-[1deg]",
];

export function IndustriesSection() {
  return (
    <section
      id={industries.id}
      className={`border-b-4 border-gaude-black bg-gaude-orange px-4 py-16 md:px-8 md:py-24 ${sectionFlow}`}
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading 
          title={
            <>
              Built for Businesses That Want to <span className="text-gaude-black">Grow Smarter</span>
            </>
          } 
          light
        />

        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {industries.items.map((item, i) => (
            <SlamBlock
              key={item.title}
              id={`slam-industry-${i}`}
              hoverClasses="hover:-translate-y-2"
              initRotate={initRotates[i % initRotates.length]}
              style={{ transitionDelay: `${(i % 4) * 100}ms` }}
              className="border-4 border-gaude-black bg-white p-6 shadow-[6px_6px_0_0_#0a0a0a] md:p-8"
            >
              <article>
                <h3 className="font-archivo text-xl uppercase tracking-tighter text-gaude-black md:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-3 font-inter text-sm font-medium leading-relaxed text-gaude-black/85 md:text-base">
                  {item.body}
                </p>
              </article>
            </SlamBlock>
          ))}
        </div>
      </div>
    </section>
  );
}
