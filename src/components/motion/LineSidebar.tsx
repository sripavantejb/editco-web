"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type CSSProperties,
  type PointerEvent,
} from "react";

const FALLOFF_CURVES = {
  linear: (p: number) => p,
  smooth: (p: number) => p * p * (3 - 2 * p),
  sharp: (p: number) => p * p * p,
} as const;

type Falloff = keyof typeof FALLOFF_CURVES;

export type LineSidebarProps = {
  items?: string[];
  accentColor?: string;
  textColor?: string;
  markerColor?: string;
  showIndex?: boolean;
  showMarker?: boolean;
  proximityRadius?: number;
  maxShift?: number;
  falloff?: Falloff;
  markerLength?: number;
  markerGap?: number;
  tickScale?: number;
  scaleTick?: boolean;
  itemGap?: number;
  fontSize?: number;
  smoothing?: number;
  defaultActive?: number | null;
  activeIndex?: number | null;
  onItemClick?: (index: number, label: string) => void;
  className?: string;
};

export function LineSidebar({
  items = [],
  accentColor = "#ff4e00",
  textColor = "#9a9a94",
  markerColor = "#2a2a2a",
  showIndex = true,
  showMarker = true,
  proximityRadius = 100,
  maxShift = 30,
  falloff = "smooth",
  markerLength = 60,
  markerGap = 0,
  tickScale = 0.5,
  scaleTick = true,
  itemGap = 20,
  fontSize = 1.1,
  smoothing = 100,
  defaultActive = null,
  activeIndex: controlledActive = null,
  onItemClick,
  className = "",
}: LineSidebarProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const targetsRef = useRef<number[]>([]);
  const currentRef = useRef<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const activeRef = useRef(defaultActive);
  const smoothingRef = useRef(smoothing);
  const [activeIndex, setActiveIndex] = useState<number | null>(defaultActive);

  useEffect(() => {
    if (controlledActive == null) return;
    setActiveIndex(controlledActive);
  }, [controlledActive]);

  activeRef.current = activeIndex;
  smoothingRef.current = smoothing;

  const runFrame = useCallback((now: number) => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const tau = Math.max(smoothingRef.current, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);

    let moving = false;
    const listItems = itemRefs.current;
    for (let i = 0; i < listItems.length; i++) {
      const el = listItems[i];
      if (!el) continue;
      const target = Math.max(
        targetsRef.current[i] || 0,
        activeRef.current === i ? 1 : 0
      );
      const cur = currentRef.current[i] || 0;
      const next = cur + (target - cur) * k;
      const settled = Math.abs(target - next) < 0.0015;
      const value = settled ? target : next;
      currentRef.current[i] = value;
      el.style.setProperty("--effect", value.toFixed(4));
      if (!settled) moving = true;
    }

    rafRef.current = moving ? requestAnimationFrame(runFrame) : null;
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) return;
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLUListElement>) => {
      const list = listRef.current;
      if (!list) return;
      const rect = list.getBoundingClientRect();
      const pointerY = e.clientY - rect.top;
      const ease = FALLOFF_CURVES[falloff] ?? FALLOFF_CURVES.linear;
      const listItems = itemRefs.current;
      for (let i = 0; i < listItems.length; i++) {
        const el = listItems[i];
        if (!el) continue;
        const center = el.offsetTop + el.offsetHeight / 2;
        const distance = Math.abs(pointerY - center);
        targetsRef.current[i] = ease(
          Math.max(0, 1 - distance / proximityRadius)
        );
      }
      startLoop();
    },
    [falloff, proximityRadius, startLoop]
  );

  const handlePointerLeave = useCallback(() => {
    targetsRef.current = targetsRef.current.map(() => 0);
    startLoop();
  }, [startLoop]);

  const handleClick = useCallback(
    (index: number, label: string) => {
      setActiveIndex(index);
      onItemClick?.(index, label);
    },
    [onItemClick]
  );

  useEffect(() => {
    startLoop();
  }, [activeIndex, startLoop]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const tickClass = showMarker
    ? `after:absolute after:left-[calc(-1*var(--marker-length)-var(--marker-gap))] after:top-[calc(100%+var(--item-gap)/2)] after:h-px after:opacity-50 after:content-[''] last:after:content-none after:[background-color:var(--marker-color)] after:[width:calc(var(--marker-length)*var(--tick-scale))] ${
        scaleTick
          ? "after:origin-left after:[transform:translateY(-50%)_scaleX(calc(0.7+var(--effect,0)*0.6))]"
          : "after:-translate-y-1/2"
      }`
    : "";

  const style = {
    "--accent-color": accentColor,
    "--text-color": textColor,
    "--marker-color": markerColor,
    "--marker-length": `${markerLength}px`,
    "--marker-gap": `${markerGap}px`,
    "--tick-scale": tickScale,
    "--max-shift": `${maxShift}px`,
    "--item-gap": `${itemGap}px`,
    "--font-size": `${fontSize}rem`,
    "--smoothing": `${smoothing}ms`,
  } as CSSProperties;

  return (
    <nav
      className={`relative flex justify-start${showMarker ? " [padding-left:calc(var(--marker-length)+var(--marker-gap))]" : ""}${className ? ` ${className}` : ""}`}
      style={style}
    >
      <ul
        ref={listRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="m-0 flex list-none flex-col py-4 [gap:var(--item-gap)]"
      >
        {items.map((label, index) => (
          <li
            key={`${label}-${index}`}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            aria-current={activeIndex === index ? "true" : undefined}
            onClick={() => handleClick(index, label)}
            className={`relative cursor-pointer before:absolute before:-inset-y-[6px] before:content-[''] ${
              showMarker ? "before:-inset-x-12" : "before:-inset-x-2"
            } ${tickClass}`}
          >
            {showMarker && (
              <span
                aria-hidden="true"
                className="absolute top-1/2 left-[calc(-1*var(--marker-length)-var(--marker-gap))] h-px w-[length:var(--marker-length)] origin-left [background-color:color-mix(in_srgb,var(--accent-color)_calc(var(--effect,0)*100%),var(--marker-color))] [transform:translateY(-50%)_scaleX(calc(0.7+var(--effect,0)*0.5))]"
              />
            )}
            <span className="relative inline-flex max-w-full items-baseline leading-[1.2] break-words [color:color-mix(in_srgb,var(--accent-color)_calc(var(--effect,0)*100%),var(--text-color))] [font-size:var(--font-size)] [transform:translateX(calc(var(--effect,0)*var(--max-shift)))]">
              {showIndex && (
                <span className="mr-[0.6rem] shrink-0 font-mono text-[0.85em] [opacity:calc(0.55+var(--effect,0)*0.45)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              <span className="min-w-0">{label}</span>
            </span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
