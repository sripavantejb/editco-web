"use client";

import { useEffect, useState } from "react";

function isInteractiveTarget(el: Element | null) {
  if (!el || !(el instanceof HTMLElement)) return false;
  return !!(
    el.closest("a") ||
    el.closest("button") ||
    el.closest(".cursor-pointer") ||
    el.closest(".word") ||
    el.closest("[href]") ||
    document.documentElement.classList.contains("ecm-chip-hover")
  );
}

export function ClientCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const root = document.documentElement;
    root.classList.add("ecm-hide-system-cursor");
    let frame = 0;
    frame = requestAnimationFrame(() => {
      setEnabled(true);
    });

    const handleMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      const under = document.elementFromPoint(e.clientX, e.clientY);
      setIsHovering(isInteractiveTarget(under));
    };

    window.addEventListener("mousemove", handleMove);

    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove("ecm-hide-system-cursor");
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[99999] mix-blend-difference hidden md:flex items-center justify-center transition-transform duration-75 ease-out"
      style={{ transform: `translate(${mousePos.x - 16}px, ${mousePos.y - 16}px)` }}
      aria-hidden
    >
      <div
        className={`bg-white rounded-full transition-all duration-300 ${isHovering ? "w-10 h-10 opacity-70" : "w-4 h-4 opacity-100"}`}
      />
    </div>
  );
}
