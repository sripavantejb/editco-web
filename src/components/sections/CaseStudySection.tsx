"use client";
import { caseStudy, works } from "@/content/landing";
import { motion } from "framer-motion";
import { sectionFlow } from "@/lib/stickyStack";
import { Plus } from "lucide-react";

export function CaseStudySection() {
  return (
    <section
      id={caseStudy.id}
      className={`relative min-h-screen bg-white py-24 ${sectionFlow}`}
    >
      <div className="mx-auto max-w-[1400px] px-4 md:px-8">
        <div className="mb-16">
          <h2 className="font-archivo text-3xl uppercase leading-[0.95] tracking-tighter text-gaude-black md:text-5xl lg:text-6xl">
            SELECTED <br /> WORKS
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {works.map((work) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`group relative overflow-hidden rounded-[32px] bg-gaude-black ${
                work.fullWidth ? "md:col-span-2 aspect-[16/9] md:aspect-[21/9]" : "aspect-[4/3] md:aspect-[1/1]"
              }`}
            >
              {/* Video Background */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                >
                  <source src={work.video} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
              </div>

              {/* Content Overlays */}
              <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-12">
                {/* Top Info */}
                <div className="flex flex-col gap-1">
                  <h3 className="font-archivo text-3xl font-medium tracking-tight text-white md:text-5xl">
                    {work.title}
                  </h3>
                  <p className="font-archivo text-xl font-light text-white/70 md:text-2xl">
                    {work.location}
                  </p>
                </div>

                {/* Bottom Info */}
                <div className="flex items-end justify-between">
                  <p className="font-archivo text-base font-medium tracking-tight text-white/90 md:text-xl">
                    {work.category}
                  </p>
                  
                  {/* Plus Trigger Button (matches ref) */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-gaude-black transition-transform group-hover:rotate-90 md:h-16 md:w-16">
                    <Plus className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
