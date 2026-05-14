import { whyEditco } from "@/content/landing";
import { SlamBlock } from "@/components/motion/SlamBlock";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionFlow } from "@/lib/stickyStack";

export function WhySection() {
  return (
    <section
      id={whyEditco.id}
      className={`border-b-4 border-gaude-black bg-white px-4 py-16 md:px-8 md:py-24 ${sectionFlow}`}
    >
      <div className="pointer-events-none absolute left-[8%] top-[12%] h-[280px] w-[280px] rounded-full bg-gaude-purple/20 blur-[100px] md:h-[420px] md:w-[420px] animate-[pulse-glow_8s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute bottom-[10%] right-[8%] h-[200px] w-[200px] rounded-full bg-gaude-orange/15 blur-[100px] md:h-[360px] md:w-[360px] animate-[pulse-glow_6s_ease-in-out_infinite]" />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="mb-6 h-1 w-24 bg-[linear-gradient(to_right,var(--color-gaude-orange),var(--color-gaude-purple),var(--color-gaude-orange))] bg-[length:200%_auto] animate-[gradient-x_3s_linear_infinite]" />
        <SectionHeading 
          title={
            <>
              Why Businesses Choose <span className="text-gaude-orange">Editco Media</span>
            </>
          } 
        />

        <div className="flex flex-col gap-6">
          {whyEditco.points.map((pt, i) => (
            <SlamBlock
              key={pt.title}
              id={`slam-why-${i}`}
              hoverClasses="opacity-100"
              initRotate="rotate-[0deg]"
              style={{ transitionDelay: `${i * 100}ms` }}
              className={`flex flex-col gap-3 border-l-8 border-gaude-black py-6 pl-6 pr-4 md:flex-row md:items-start md:gap-10 md:pl-8 md:pr-8 ${i % 2 === 0 ? "bg-gaude-purple/15" : "bg-gaude-green/20"}`}
            >
              <span className="font-archivo text-4xl font-black leading-none text-gaude-orange md:text-5xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="font-syne text-xl font-black uppercase tracking-tight text-gaude-black md:text-2xl">
                  {pt.title}
                </h3>
                <p className="mt-2 max-w-3xl font-inter text-sm font-medium leading-relaxed text-gaude-black/85 md:text-base">
                  {pt.body}
                </p>
              </div>
            </SlamBlock>
          ))}
        </div>
      </div>
    </section>
  );
}
