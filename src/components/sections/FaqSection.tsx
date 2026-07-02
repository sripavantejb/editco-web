import { Plus } from "lucide-react";
import { faq } from "@/content/landing";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionFlow } from "@/lib/stickyStack";

export function FaqSection() {
  return (
    <section
      id={faq.id}
      className={`border-b-4 border-gaude-black bg-gaude-black px-4 py-16 md:px-8 md:py-24 ${sectionFlow}`}
    >
      <div className="mx-auto max-w-3xl">
        <SectionHeading title={faq.heading} light />

        <div className="mt-8 flex flex-col gap-4">
          {faq.items.map((item) => (
            <details
              key={item.q}
              className="group border-4 border-white/20 bg-white/5 open:bg-white/10 transition-colors"
            >
              <summary className="cursor-pointer list-none px-5 py-4 font-archivo text-sm font-black uppercase tracking-wide text-white marker:content-none md:text-base [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <Plus className="size-5 text-gaude-orange transition-transform group-open:rotate-45" strokeWidth={3} />
                </span>
              </summary>
              <div className="border-t-2 border-white/10 px-5 pb-5 pt-2 font-inter text-sm font-medium leading-relaxed text-white/85 md:text-base">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
