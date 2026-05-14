"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type SlamVisibility = Record<string, boolean>;

const SlamVisibilityContext = createContext<SlamVisibility>({});

export function SlamVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [visibleItems, setVisibleItems] = useState<SlamVisibility>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            setVisibleItems((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 },
    );

    document.querySelectorAll(".animate-slam").forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const value = useMemo(() => visibleItems, [visibleItems]);

  return (
    <SlamVisibilityContext.Provider value={value}>{children}</SlamVisibilityContext.Provider>
  );
}

export function useSlamVisible(id: string) {
  return useContext(SlamVisibilityContext)[id] ?? false;
}

function getSlamClass(
  id: string,
  visibleItems: SlamVisibility,
  hoverClasses: string,
  initRotate = "rotate-[5deg]",
) {
  const isVisible = visibleItems[id];
  return `animate-slam transition-all duration-[800ms] ease-[cubic-bezier(0.1,1,0.2,1)] ${isVisible ? `pointer-events-auto opacity-100 translate-y-0 rotate-0 ${hoverClasses}` : `pointer-events-none opacity-0 translate-y-24 ${initRotate}`}`;
}

export function useSlamClass(
  id: string,
  hoverClasses: string,
  initRotate?: string,
): string {
  const visibleItems = useContext(SlamVisibilityContext);
  return useMemo(
    () => getSlamClass(id, visibleItems, hoverClasses, initRotate),
    [id, visibleItems, hoverClasses, initRotate],
  );
}
