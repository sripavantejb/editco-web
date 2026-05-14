import { tech } from "@/content/landing";
import { SlamBlock } from "@/components/motion/SlamBlock";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TagChip } from "@/components/ui/TagChip";
import { sectionFlow } from "@/lib/stickyStack";

export function TechSection() {
  return (
    <section
      id={tech.id}
      className={`flex min-h-[85svh] flex-col justify-center border-b-4 border-gaude-black bg-white px-4 py-16 md:min-h-[90svh] md:px-8 md:py-24 ${sectionFlow}`}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading title={tech.heading} description={tech.description} />

        <SlamBlock
          id="slam-tech-stack"
          hoverClasses="opacity-100"
          initRotate="rotate-[1deg]"
          className="mt-8 flex flex-wrap gap-3"
        >
          {tech.items.map((t) => (
            <TagChip key={t} inverted>
              {t}
            </TagChip>
          ))}
        </SlamBlock>
      </div>
    </section>
  );
}
