import { testimonials } from "@/content/landing";
import { SlamBlock } from "@/components/motion/SlamBlock";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sectionFlow } from "@/lib/stickyStack";

export function TestimonialsSection() {
  return (
    <section
      id={testimonials.id}
      className={`border-b-4 border-gaude-black bg-gaude-orange px-4 py-16 md:px-8 md:py-24 ${sectionFlow}`}
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading 
          title={
            <>
              What People Say About <span className="text-gaude-black">Working With Us</span>
            </>
          } 
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {testimonials.cards.map((card, i) => (
            <SlamBlock
              key={card.author}
              id={`slam-testimonial-${i}`}
              hoverClasses="hover:-translate-y-2"
              initRotate={i % 2 === 0 ? "rotate-[-2deg]" : "rotate-[2deg]"}
              style={{ transitionDelay: `${i * 150}ms` }}
              className="border-4 border-gaude-black bg-white p-6 shadow-[6px_6px_0_0_#0a0a0a] md:p-8"
            >
              <blockquote>
                <p className="font-inter text-sm font-medium leading-relaxed text-gaude-black md:text-base">
                  “{card.quote}”
                </p>
                <footer className="mt-6 font-archivo text-xs font-black uppercase tracking-widest text-gaude-black/60">
                  {card.author} · {card.business}
                </footer>
              </blockquote>
            </SlamBlock>
          ))}
        </div>

        <p className="mt-10 text-center font-syne text-base font-bold text-gaude-black md:text-lg">
          {testimonials.fallback}
        </p>
      </div>
    </section>
  );
}
