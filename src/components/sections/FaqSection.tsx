import { Plus } from "lucide-react";
import { faq } from "@/content/landing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionFlowAfter } from "@/lib/stickyStack";

export function FaqSection() {
  return (
    <section
      id={faq.id}
      className={`border-b-4 border-gaude-black bg-gaude-black px-4 py-16 md:px-8 md:py-24 ${sectionFlowAfter}`}
    >
      <div className="mx-auto max-w-3xl">
        <SectionHeading title={faq.heading} light />

        <div className="mt-8 flex flex-col gap-4">
          {faq.items.map((item) => (
            <details
              key={item.q}
              className="group border-4 border-white/20 bg-white/5 open:bg-white/10 transition-colors"
            >
              <summary className="cursor-pointer list-none px-4 py-4 font-archivo text-sm font-black uppercase tracking-wide text-white marker:content-none sm:px-5 md:text-base [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-3 sm:items-center sm:gap-4">
                  <span className="min-w-0 break-words">{item.q}</span>
                  <Plus className="mt-0.5 size-5 shrink-0 text-gaude-orange transition-transform group-open:rotate-45" strokeWidth={3} />
                </span>
              </summary>
              <div className="border-t-2 border-white/10 px-4 pb-5 pt-2 font-inter text-sm font-medium leading-relaxed text-white/85 sm:px-5 md:text-base">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
