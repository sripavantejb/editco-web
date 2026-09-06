"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type HoverExpandImage = {
  src: string;
  alt: string;
  code: string;
};

/**
 * HoverExpand — adapted from Skiper 52 / HoverExpand_001 (Framer Motion).
 * Attribution: Skiper UI · @gurvinder-singh02
 */
export function HoverExpand({
  images,
  className,
}: {
  images: HoverExpandImage[];
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [activeImage, setActiveImage] = useState(0);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className={cn("relative w-full", className)}
    >
      <div className="-mx-4 flex w-[calc(100%+2rem)] items-stretch justify-start gap-1.5 overflow-x-auto px-4 pb-2 md:mx-0 md:w-full md:justify-center md:overflow-x-auto md:px-0 md:pb-0">
        {images.map((image, index) => {
          const isActive = activeImage === index;

          return (
            <motion.div
              key={image.src + index}
              className="relative shrink-0 cursor-pointer overflow-hidden rounded-3xl bg-[#141414]"
              initial={false}
              animate={{
                width: isActive ? 600 : 68,
                height: 340,
              }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      width: {
                        type: "spring",
                        stiffness: 90,
                        damping: 20,
                        mass: 0.85,
                      },
                      height: {
                        type: "spring",
                        stiffness: 90,
                        damping: 20,
                        mass: 0.85,
                      },
                    }
              }
              onClick={() => setActiveImage(index)}
              onHoverStart={() => setActiveImage(index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={isActive ? "(max-width: 768px) 90vw, 640px" : "72px"}
                className={cn(
                  "transition-[object-fit] duration-300",
                  isActive
                    ? "object-contain object-center p-2"
                    : "object-cover object-center"
                )}
                priority={index < 2}
                unoptimized={image.src.startsWith("/api/")}
              />
              <AnimatePresence>
                {isActive ? (
                  <motion.div
                    key="shade"
                    initial={reduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.33, 1, 0.68, 1] }}
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent"
                  />
                ) : null}
              </AnimatePresence>
              <AnimatePresence>
                {isActive ? (
                  <motion.div
                    key="meta"
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.12,
                      ease: [0.33, 1, 0.68, 1],
                    }}
                    className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start justify-end p-4 md:p-5"
                  >
                    <p className="font-archivo text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">
                      {image.code}
                    </p>
                    <p className="mt-1 font-archivo text-sm font-bold uppercase tracking-tight text-white md:text-base">
                      {image.alt}
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
