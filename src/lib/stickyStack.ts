/**
 * Sticky “page slides” (Dpka-style) — only safe on short, opaque, single-viewport blocks.
 * These stack on top of each other as the user scrolls.
 */
const stickySlideCore =
  "sticky top-0 min-h-[100svh] w-full border-b-4 border-gaude-black shadow-[0_-20px_40px_rgba(0,0,0,0.3)]";

/** Stack order: lower z-index sections appear first and are covered by higher z-index sections. */
export const stickySlide1 = `${stickySlideCore} z-10`;
export const stickySlide2 = `${stickySlideCore} z-20`;
export const stickySlide3 = `${stickySlideCore} z-[25]`;
export const stickySlide4 = `${stickySlideCore} z-30`;

/** Default: normal document flow for all subsequent sections (scrolling over the sticky stack) */
export const sectionFlow = "relative z-[40] w-full";


