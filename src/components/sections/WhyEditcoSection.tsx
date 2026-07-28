"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { whyEditco } from "@/content/landing";
import { sectionFlow } from "@/lib/stickyStack";

gsap.registerPlugin(ScrollTrigger);

/**
 * Why Editco — sticky horizontal focus-scroll.
 * Extra end hold so the last card can settle in center before the next section.
 */
const SCALE_MIN = 0.78;
const SCALE_MAX = 1.08;
const Y_FAR = 48;
const Y_FOCUS = -36;

const SCALE_MIN_MOBILE = 0.88;
const SCALE_MAX_MOBILE = 1.02;
const Y_FAR_MOBILE = 20;
const Y_FOCUS_MOBILE = -12;

/** How much of the scroll is “move cards” vs “hold last card” */
const MOVE_RATIO = 1;
const HOLD_RATIO = 0.12;
/** Slight stretch so scrub feels smooth without dragging on the last card */
const TRAVEL_EASE = 1.1;

export function WhyEditcoSection() {
  const stageRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const fillMaskRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const sticky = stickyRef.current;
    const fillMask = fillMaskRef.current;
    const track = trackRef.current;
    if (!stage || !sticky || !fillMask || !track) return;

    const cardEls = () => cardRefs.current.filter(Boolean) as HTMLElement[];
    const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

    /** Move until the last card’s center sits on the viewport center */
    const getTravel = () => {
      const cards = cardEls();
      if (cards.length < 2) {
        return Math.max(track.scrollWidth - window.innerWidth, window.innerWidth * 0.9);
      }
      const first = cards[0];
      const last = cards[cards.length - 1];
      // First card starts near center (side padding). Shift by center-to-center gap.
      const centerToCenter =
        last.offsetLeft +
        last.offsetWidth / 2 -
        (first.offsetLeft + first.offsetWidth / 2);
      const byScroll = track.scrollWidth - window.innerWidth;
      return Math.max(centerToCenter, byScroll, window.innerWidth * 0.9);
    };

    const ctx = gsap.context(() => {
      const updateFocus = () => {
        const viewCenter = window.innerWidth / 2;
        const maxDist = window.innerWidth * 0.55;
        const mobile = isMobile();
        const sMin = mobile ? SCALE_MIN_MOBILE : SCALE_MIN;
        const sMax = mobile ? SCALE_MAX_MOBILE : SCALE_MAX;
        const yFar = mobile ? Y_FAR_MOBILE : Y_FAR;
        const yFocus = mobile ? Y_FOCUS_MOBILE : Y_FOCUS;

        cardEls().forEach((card) => {
          const rect = card.getBoundingClientRect();
          const cardCenter = rect.left + rect.width / 2;
          const dist = Math.abs(viewCenter - cardCenter);
          const t = 1 - Math.min(dist / maxDist, 1);
          const focus = t * t * (3 - 2 * t);

          gsap.set(card, {
            scale: sMin + (sMax - sMin) * focus,
            y: yFar + (yFocus - yFar) * focus,
            zIndex: Math.round(10 + focus * 20),
            transformOrigin: "center center",
            force3D: true,
          });
        });
      };

      const syncStageHeight = () => {
        const travel = getTravel() * TRAVEL_EASE;
        const hold = window.innerHeight * 0.15;
        stage.style.height = `${travel + window.innerHeight + hold}px`;
      };

      const mobile = isMobile();
      gsap.set(track, { x: 0, force3D: true });
      gsap.set(fillMask, { width: "0%" });
      gsap.set(cardEls(), {
        scale: mobile ? SCALE_MIN_MOBILE : SCALE_MIN,
        y: mobile ? Y_FAR_MOBILE : Y_FAR,
        transformOrigin: "center center",
      });
      syncStageHeight();

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.6,
          invalidateOnRefresh: true,
          onRefresh: () => {
            syncStageHeight();
            updateFocus();
          },
          onUpdate: updateFocus,
        },
      });

      // Move + fill for most of the scrub, then hold so last card stays centered
      tl.to(fillMask, { width: "100%", duration: MOVE_RATIO }, 0);
      tl.to(
        track,
        {
          x: () => -getTravel(),
          duration: MOVE_RATIO,
          ease: "power1.inOut",
          onUpdate: updateFocus,
        },
        0
      );
      tl.to({}, { duration: HOLD_RATIO });

      updateFocus();
    }, stage);

    const refresh = () => ScrollTrigger.refresh();
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(refresh);
    });
    window.addEventListener("resize", refresh);
    document.fonts?.ready?.then(refresh);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", refresh);
      stage.style.height = "";
      ctx.revert();
    };
  }, []);

  return (
    <section
      id={whyEditco.id}
      ref={stageRef}
      className={`relative scroll-mt-24 bg-gaude-black text-white ${sectionFlow}`}
      aria-label="Why Editco"
    >
      <div
        ref={stickyRef}
        className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden bg-gaude-black"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden px-4 select-none sm:px-8 md:px-12"
        >
          <div className="relative max-w-full leading-none">
            <span
              className="font-syne block whitespace-nowrap text-[clamp(2rem,11vw,8.5rem)] font-extrabold tracking-[-0.05em] lowercase"
              style={{ color: "#1a1a1a" }}
            >
              why editco
            </span>
            <div
              ref={fillMaskRef}
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: "0%" }}
            >
              <span className="absolute top-0 left-0 block whitespace-nowrap font-syne text-[clamp(2rem,11vw,8.5rem)] font-extrabold tracking-[-0.05em] lowercase text-gaude-orange">
                why editco
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-20 w-full overflow-x-hidden py-8 sm:py-10 md:py-14">
          <div
            ref={trackRef}
            className="flex w-max items-center gap-6 will-change-transform px-[max(1.25rem,calc(50vw-150px))] sm:gap-10 sm:px-[max(1.5rem,calc(50vw-170px))] md:gap-14 md:px-[max(2rem,calc(50vw-210px))] lg:gap-16 lg:px-[max(2rem,calc(50vw-220px))]"
          >
            {whyEditco.points.map((item, index) => {
              const num = String(index + 1).padStart(2, "0");
              return (
                <article
                  key={item.title}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  className="flex h-[320px] w-[min(280px,82vw)] shrink-0 flex-col justify-between rounded-2xl border border-white/10 p-5 sm:h-[400px] sm:w-[340px] sm:p-7 md:h-[440px] md:w-[400px] md:rounded-[1.25rem] md:p-8 lg:w-[420px]"
                  style={{
                    backgroundColor: "rgba(22, 22, 22, 0.55)",
                    boxShadow: "0 28px 70px rgba(0,0,0,0.55)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-gaude-orange" />
                    <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/90 md:text-xs">
                      {num}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-syne text-[1.15rem] font-extrabold leading-[1.15] tracking-[-0.03em] text-white uppercase sm:text-[1.3rem] md:text-[1.5rem]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#a0a09a] sm:mt-4 md:text-[15px]">
                      {item.body}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
