"use client";

import { useSlamClass } from "./SlamVisibilityProvider";

export function SlamBlock({
  id,
  children,
  className = "",
  hoverClasses = "",
  initRotate = "rotate-[5deg]",
  style,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
  hoverClasses?: string;
  initRotate?: string;
  style?: React.CSSProperties;
}) {
  const slamClass = useSlamClass(id, hoverClasses, initRotate);
  return (
    <div id={id} className={`${slamClass} ${className}`} style={style}>
      {children}
    </div>
  );
}
