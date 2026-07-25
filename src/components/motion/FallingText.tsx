"use client";

import { useRef, useEffect } from "react";
import Matter from "matter-js";
import "./FallingText.css";

type FallingTextProps = {
  className?: string;
  text?: string;
  highlightWords?: string[];
  wordClassMap?: Record<string, string>;
  highlightClass?: string;
  trigger?: "click" | "hover" | "auto" | "scroll";
  gravity?: number;
  mouseConstraintStiffness?: number;
  fontSize?: string;
};

type MatterMouseHandlers = Matter.Mouse & {
  mousemove: EventListener;
  mousedown: EventListener;
  mouseup: EventListener;
  mousewheel: EventListener;
};

/** Matter.Mouse.setElement never removes listeners — do it ourselves. */
function unbindMouseElement(mouse: Matter.Mouse | null) {
  if (!mouse?.element) return;
  const m = mouse as MatterMouseHandlers;
  const el = mouse.element;
  el.removeEventListener("mousemove", m.mousemove);
  el.removeEventListener("mousedown", m.mousedown);
  el.removeEventListener("mouseup", m.mouseup);
  el.removeEventListener("wheel", m.mousewheel);
  el.removeEventListener("touchmove", m.mousemove);
  el.removeEventListener("touchstart", m.mousedown);
  el.removeEventListener("touchend", m.mouseup);
}

function unbindMouseWindow(mouse: Matter.Mouse | null) {
  if (!mouse) return;
  const m = mouse as MatterMouseHandlers;
  window.removeEventListener("mousemove", m.mousemove);
  window.removeEventListener("mousedown", m.mousedown);
  window.removeEventListener("mouseup", m.mouseup);
  window.removeEventListener("touchmove", m.mousemove, true);
  window.removeEventListener("touchstart", m.mousedown, true);
  window.removeEventListener("touchend", m.mouseup, true);
}

function bindMouseWindow(mouse: Matter.Mouse) {
  const m = mouse as MatterMouseHandlers;
  // Window listeners so the overlay can stay pointer-events: none (footer forms stay clickable)
  window.addEventListener("mousemove", m.mousemove, { passive: true });
  window.addEventListener("mousedown", m.mousedown, { passive: true });
  window.addEventListener("mouseup", m.mouseup, { passive: true });
  window.addEventListener("touchmove", m.mousemove, { passive: false, capture: true });
  window.addEventListener("touchstart", m.mousedown, { passive: false, capture: true });
  window.addEventListener("touchend", m.mouseup, { passive: false, capture: true });
}

/**
 * Footer industry chips — Matter physics with reliable grab/throw.
 */
export default function FallingText({
  className = "",
  text = "",
  highlightWords = [],
  wordClassMap = {},
  highlightClass = "highlighted",
  trigger = "auto",
  gravity = 1,
  mouseConstraintStiffness = 0.9,
  fontSize = "1rem",
}: FallingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl || !text) return;

    const words = text.split(/\s+/).filter(Boolean);
    textEl.innerHTML = words
      .map((word) => {
        const mapped = Object.keys(wordClassMap).find((hw) =>
          word.toLowerCase().startsWith(hw.toLowerCase())
        );
        const isHighlighted = highlightWords.some((hw) =>
          word.toLowerCase().startsWith(hw.toLowerCase())
        );
        const extra = mapped
          ? wordClassMap[mapped]
          : isHighlighted
            ? highlightClass
            : "";
        return `<span class="word ${extra}">${word}</span>`;
      })
      .join(" ");

    const wordSpans = [...textEl.querySelectorAll<HTMLElement>(".word")];
    if (!wordSpans.length) return;

    let cancelled = false;
    let started = false;
    let raf = 0;
    let engine: Matter.Engine | null = null;
    let runner: Matter.Runner | null = null;
    let mouse: Matter.Mouse | null = null;
    let mouseConstraint: Matter.MouseConstraint | null = null;
    let boundToWindow = false;

    const { Engine, World, Bodies, Runner, Mouse, MouseConstraint, Body, Events } =
      Matter;

    const startPhysics = () => {
      if (cancelled || started) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width <= 0 || height <= 0) return;
      started = true;

      engine = Engine.create({ enableSleeping: false });
      engine.gravity.x = 0;
      engine.gravity.y = gravity;
      engine.gravity.scale = 0.001;

      const wallOpts: Matter.IChamferableBodyDefinition = {
        isStatic: true,
        render: { visible: false },
        friction: 0.35,
        restitution: 0.15,
      };

      const floor = Bodies.rectangle(width / 2, height - 80, width + 200, 40, wallOpts);
      const left = Bodies.rectangle(-22, height / 2, 44, height + 200, wallOpts);
      const right = Bodies.rectangle(width + 22, height / 2, 44, height + 200, wallOpts);
      const ceiling = Bodies.rectangle(width / 2, -22, width + 200, 44, wallOpts);

      textEl.style.position = "absolute";
      textEl.style.inset = "0";
      textEl.style.width = "100%";
      textEl.style.height = "100%";
      textEl.style.maxWidth = "none";
      textEl.style.pointerEvents = "none";

      const pairs = wordSpans.map((elem, i) => {
        const w = Math.max(elem.offsetWidth || 80, 56);
        const h = Math.max(elem.offsetHeight || 36, 32);
        const x = ((i + 0.5) / wordSpans.length) * (width - 48) + 24;
        const y = 12 + (i % 4) * 10;

        const body = Bodies.rectangle(x, y, w, h, {
          restitution: 0.45,
          friction: 0.04,
          frictionAir: 0.008,
          density: 0.0018,
          chamfer: { radius: Math.min(14, h / 2) },
          label: `chip-${i}`,
          render: { visible: false },
        });

        Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 2.5,
          y: 1.5 + Math.random() * 2,
        });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.06);

        elem.classList.add("cursor-pointer");
        elem.style.position = "absolute";
        elem.style.left = "0";
        elem.style.top = "0";
        // Chips catch hover (custom hand cursor) + clicks; empty overlay stays pass-through
        elem.style.pointerEvents = "auto";
        elem.style.zIndex = "2";
        elem.style.willChange = "transform";
        elem.style.cursor = "grab";
        elem.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;

        return { elem, body };
      });

      const chipBodies = pairs.map((p) => p.body);
      let dragging = false;

      // Keep element = container for coordinate math; move listeners to window
      // so pointer-events:none overlay does not block footer UI.
      mouse = Mouse.create(container);
      mouse.pixelRatio = 1;
      unbindMouseElement(mouse);

      const m = mouse as MatterMouseHandlers;
      const rawDown = m.mousedown;
      const rawMove = m.mousemove;
      const rawUp = m.mouseup;
      const { Query } = Matter;

      const syncHoverCursor = () => {
        if (!mouse || dragging) return;
        const hits = Query.point(chipBodies, mouse.position);
        if (hits.length > 0) {
          document.documentElement.classList.add("ecm-chip-hover");
          document.body.style.cursor = "grab";
        } else {
          document.documentElement.classList.remove("ecm-chip-hover");
          document.body.style.cursor = "";
        }
      };

      m.mousedown = ((event: Event) => {
        if (!mouse?.element?.isConnected) return;
        const t = event.target as HTMLElement | null;
        if (
          t &&
          (t.closest("input, textarea, select, button, a, label") ||
            t.isContentEditable)
        ) {
          return;
        }
        rawDown(event);
      }) as EventListener;

      m.mousemove = ((event: Event) => {
        if (!mouse?.element?.isConnected) return;
        rawMove(event);
        syncHoverCursor();
      }) as EventListener;

      m.mouseup = ((event: Event) => {
        if (!mouse?.element?.isConnected) return;
        rawUp(event);
      }) as EventListener;

      bindMouseWindow(mouse);
      boundToWindow = true;

      mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: mouseConstraintStiffness,
          damping: 0.02,
          length: 0,
          render: { visible: false },
        },
      });

      Events.on(mouseConstraint, "startdrag", () => {
        dragging = true;
        document.documentElement.classList.add("ecm-chip-hover");
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
        for (const { elem } of pairs) elem.style.cursor = "grabbing";
      });

      Events.on(mouseConstraint, "enddrag", (event) => {
        dragging = false;
        document.body.style.userSelect = "";
        for (const { elem } of pairs) elem.style.cursor = "grab";
        syncHoverCursor();
        const body = (event as { body?: Matter.Body }).body;
        if (!body) return;
        // Keep throw momentum snappy
        Body.setVelocity(body, {
          x: body.velocity.x * 1.35,
          y: body.velocity.y * 1.35,
        });
        Body.setAngularVelocity(body, body.angularVelocity * 1.15);
      });

      World.add(engine.world, [
        floor,
        left,
        right,
        ceiling,
        mouseConstraint,
        ...pairs.map((p) => p.body),
      ]);

      runner = Runner.create();
      Runner.run(runner, engine);

      const sync = () => {
        if (cancelled) return;
        for (let i = 0; i < pairs.length; i++) {
          const { body, elem } = pairs[i];
          const { x, y } = body.position;
          elem.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${body.angle}rad)`;
        }
        raf = requestAnimationFrame(sync);
      };
      raf = requestAnimationFrame(sync);
    };

    let observer: IntersectionObserver | null = null;

    if (trigger === "auto") {
      startPhysics();
    } else if (trigger === "scroll") {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            startPhysics();
            observer?.disconnect();
            observer = null;
          }
        },
        { threshold: 0, rootMargin: "40% 0px 0px 0px" }
      );
      observer.observe(container);

      const rect = container.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        startPhysics();
        observer.disconnect();
        observer = null;
      }
    }

    const onClick = () => {
      if (trigger === "click") startPhysics();
    };
    const onEnter = () => {
      if (trigger === "hover") startPhysics();
    };
    if (trigger === "click") container.addEventListener("click", onClick);
    if (trigger === "hover") container.addEventListener("mouseenter", onEnter);

    return () => {
      cancelled = true;
      observer?.disconnect();
      cancelAnimationFrame(raf);
      container.removeEventListener("click", onClick);
      container.removeEventListener("mouseenter", onEnter);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.documentElement.classList.remove("ecm-chip-hover");

      if (runner) Runner.stop(runner);
      if (engine) {
        if (mouseConstraint) {
          Events.off(mouseConstraint, "startdrag");
          Events.off(mouseConstraint, "enddrag");
          World.remove(engine.world, mouseConstraint);
        }
        World.clear(engine.world, false);
        Engine.clear(engine);
      }

      // Unbind listeners first — never leave handlers on a nulled element (HMR crash)
      if (boundToWindow) unbindMouseWindow(mouse);
      else unbindMouseElement(mouse);
      mouse = null;
      mouseConstraint = null;
      engine = null;
      runner = null;
    };
  }, [
    text,
    highlightWords,
    highlightClass,
    wordClassMap,
    trigger,
    gravity,
    mouseConstraintStiffness,
  ]);

  return (
    <div
      ref={containerRef}
      className={`falling-text-container ${className}`}
      style={{
        position: "relative",
        overflow: "hidden",
        height: "100%",
        pointerEvents: "none",
        touchAction: "none",
      }}
    >
      <div
        ref={textRef}
        className="falling-text-target"
        style={{ fontSize, lineHeight: 1.4 }}
      />
    </div>
  );
}
