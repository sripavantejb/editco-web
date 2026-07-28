/**
 * Sticky “page slides” (Dpka-style) — only safe on short, opaque, single-viewport blocks.
 * These stack on top of each other as the user scrolls (desktop/lg+ only).
 *
 * Important: sticky slides stay in the stacking context for the rest of <main>,
 * so every section AFTER the sticky stack must use a higher z-index (sectionFlow /
 * sectionFlowAfter) or it will render underneath the last sticky slide.
 */
const stickySlideCore =
  "relative w-full border-b-4 border-gaude-black shadow-[0_-20px_40px_rgba(0,0,0,0.3)] lg:sticky lg:top-0 lg:min-h-[100svh]";

/** Stack order: lower z-index sections appear first and are covered by higher z-index sections. */
export const stickySlide1 = `${stickySlideCore} z-10`;
export const stickySlide2 = `${stickySlideCore} z-20`;
export const stickySlide3 = `${stickySlideCore} z-[25]`;
export const stickySlide4 = `${stickySlideCore} z-30`;

/** Default: normal document flow scrolling over the Hero → Problem → Clients stack */
export const sectionFlow = "relative z-[40] w-full";

/** Sections after long mid-page content — must stay above the early sticky stack */
export const sectionFlowAfter = "relative z-[60] w-full";
