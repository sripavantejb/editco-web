import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getSiteWorks } from "@/lib/site-content";
import { MagneticNav } from "@/components/motion/MagneticNav";
import { FloatingBottomNav } from "@/components/motion/FloatingBottomNav";

export const dynamic = "force-dynamic";

export default async function WorkIndexPage() {
  const works = await getSiteWorks();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <MagneticNav />
      <FloatingBottomNav />

      <main className="mx-auto max-w-3xl px-5 pb-28 pt-28 sm:px-8 md:px-6 md:pb-36 md:pt-36">
        <header className="mb-14 md:mb-20">
          <p className="mb-3 font-archivo text-[10px] font-bold uppercase tracking-[0.28em] text-gaude-orange">
            Portfolio
          </p>
          <h1 className="font-archivo text-4xl font-black uppercase tracking-tighter text-white sm:text-5xl md:text-6xl">
            Work
          </h1>
          <p className="mt-4 max-w-md font-inter text-base font-medium leading-relaxed text-white/50">
            Short notes on problems we solved — websites, products, and systems.
          </p>
        </header>

        <ul className="divide-y divide-white/10">
          {works.map((work) => (
            <li key={work.id}>
              <Link
                href={`/work/${work.id}`}
                className="group flex flex-col gap-3 py-7 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-10 sm:py-8"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-archivo text-[10px] font-bold uppercase tracking-[0.18em] text-gaude-orange/90">
                      {work.category}
                    </span>
                    <span className="font-inter text-[11px] text-white/30">
                      {work.location}
                    </span>
                  </div>
                  <h2 className="font-archivo text-xl font-black uppercase leading-[1.15] tracking-tight text-white transition-colors group-hover:text-gaude-orange sm:text-2xl">
                    {work.title}
                  </h2>
                  <p className="mt-2 max-w-xl font-inter text-sm leading-relaxed text-white/40 line-clamp-2">
                    {work.problem}
                  </p>
                </div>
                <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gaude-orange sm:mt-0" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-20 border-t border-white/10 pt-10 md:mt-28 md:pt-12">
          <p className="font-archivo text-lg font-black uppercase tracking-tight text-white md:text-xl">
            Want a system like these?
          </p>
          <Link
            href="/#cta"
            className="mt-5 inline-flex items-center gap-2 font-archivo text-xs font-bold uppercase tracking-[0.2em] text-gaude-orange transition-colors hover:text-white"
          >
            Book a call
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
