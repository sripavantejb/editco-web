"use client";

import { motion } from "framer-motion";
import { positioning } from "@/content/landing";
import { sectionFlow } from "@/lib/stickyStack";
import { BrutalistLink } from "@/components/ui/BrutalistLink";

export function PositioningSection() {
  const words = positioning.statement.split(" ");

  return (
    <section
      id={positioning.id}
      className={`flex min-h-[70svh] flex-col items-center justify-center bg-gaude-black px-4 py-16 md:px-8 ${sectionFlow}`}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-12 text-center">
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.02,
              },
            },
          }}
          className="font-syne text-2xl font-bold leading-tight text-white md:text-4xl lg:text-5xl"
        >
          {words.map((word, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: 10, filter: "blur(8px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)" },
              }}
              className="inline-block mr-[0.2em]"
            >
              {word}
            </motion.span>
          ))}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
        >
          <BrutalistLink 
            href="#contact" 
            variant="orange" 
            className="px-10 py-5 text-xl font-black md:text-2xl"
          >
            BOOK YOUR STRATEGY CALL
          </BrutalistLink>
          <p className="mt-4 font-inter text-[10px] font-black uppercase tracking-widest text-white/30">
            Limited slots available for May
          </p>
        </motion.div>
      </div>
    </section>
  );
}
