"use client";

import { useEffect } from "react";

type CalInlineEmbedProps = {
  embedId: string;
  className?: string;
};

export function CalInlineEmbed({ embedId, className = "" }: CalInlineEmbedProps) {
  useEffect(() => {
    const initCal = () => {
      const Cal = (window as Window & {
        Cal?: { ns: Record<string, (cmd: string, opts: object) => void> };
      }).Cal;

      Cal?.ns["15min"]?.("inline", {
        elementOrSelector: `#${embedId}`,
        calLink: "editco-media/15min",
        config: {
          layout: "month_view",
          theme: "dark",
          useSlotsViewOnSmallScreen: "true",
        },
      });
    };

    if ((window as Window & { Cal?: unknown }).Cal) {
      initCal();
      return;
    }

    const timer = setInterval(() => {
      if ((window as Window & { Cal?: unknown }).Cal) {
        initCal();
        clearInterval(timer);
      }
    }, 500);

    return () => clearInterval(timer);
  }, [embedId]);

  return (
    <div
      id={embedId}
      className={`min-h-[420px] w-full max-w-full overflow-x-auto sm:min-h-[560px] md:min-h-[700px] ${className}`}
    />
  );
}
