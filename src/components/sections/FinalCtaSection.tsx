import { finalCta } from "@/content/landing";
import { site } from "@/content/site";
import { BrutalistLink } from "@/components/ui/BrutalistLink";
import { sectionFlow } from "@/lib/stickyStack";

export function FinalCtaSection() {
  return (
    <section
      id={finalCta.id}
      className={`relative flex min-h-[85svh] flex-col justify-center overflow-hidden border-b-4 border-gaude-black bg-gaude-pink px-4 py-16 md:min-h-[90svh] md:px-8 md:py-24 ${sectionFlow}`}
    >
      <div className="pointer-events-none absolute -bottom-[10%] -right-[5%] rotate-12 text-[14rem] leading-none opacity-20 animate-[float3_9s_ease-in-out_infinite] md:text-[22rem]">
        ✌️
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h2 className="font-archivo text-3xl uppercase leading-[0.95] tracking-tighter text-gaude-black transition-transform duration-500 hover:scale-[1.01] md:text-5xl">
          {finalCta.heading}
        </h2>
        <p className="mt-6 font-inter text-base font-medium leading-relaxed text-gaude-black/85 md:text-lg">
          {finalCta.description}
        </p>
        <p className="mt-4 font-syne text-sm font-bold uppercase tracking-tight text-gaude-black md:text-base">
          {finalCta.secondary}
        </p>
        <div className="mt-10 flex justify-center">
          <BrutalistLink 
            href={site.primaryCtaHref} 
            variant="secondary"
            data-cal-link="editco-media/15min"
            data-cal-namespace="15min"
            data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
          >
            {finalCta.primaryCta}
          </BrutalistLink>
        </div>
      </div>
    </section>
  );
}
