import { process } from "@/content/landing";
import { SlamBlock } from "@/components/motion/SlamBlock";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionFlow } from "@/lib/stickyStack";

export function ProcessSection() {
  return (
    <section
      id={process.id}
      className={`border-b-4 border-gaude-black bg-gaude-black px-4 py-16 md:px-8 md:py-24 ${sectionFlow}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <SectionHeading 
          title={
            <>
              <span className="text-gaude-green">How</span> We Work
            </>
          } 
          light 
        />

        <div className="relative mt-12 md:pl-12">
          <div className="absolute bottom-4 left-3 top-4 hidden w-1 bg-white/15 md:block" aria-hidden />

          <ol className="flex flex-col gap-10 md:gap-14">
            {process.steps.map((step, i) => (
              <li key={step.title} className="relative flex gap-6 md:gap-10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center border-4 border-white bg-gaude-orange font-archivo text-sm font-black text-white md:absolute md:-left-3 md:h-12 md:w-12">
                  {i + 1}
                </div>
                <SlamBlock
                  id={`slam-process-${i}`}
                  hoverClasses="opacity-100"
                  initRotate="rotate-[0deg]"
                  style={{ transitionDelay: `${i * 100}ms` }}
                  className="flex-1 border-4 border-white/30 bg-white/5 px-5 py-5 md:px-8 md:py-6"
                >
                  <h3 className="font-archivo text-xl uppercase tracking-tighter text-white md:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 font-inter text-sm font-medium leading-relaxed text-white/80 md:text-base">
                    {step.body}
                  </p>
                </SlamBlock>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
