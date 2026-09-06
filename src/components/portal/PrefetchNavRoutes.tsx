"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

/**
 * Warm the App Router cache for portal nav destinations during idle time
 * so the first click on a sidebar link is usually already fetched.
 */
export function PrefetchNavRoutes({ hrefs }: { hrefs: string[] }) {
  const router = useRouter();
  const key = useMemo(
    () => [...new Set(hrefs.filter(Boolean))].sort().join("\0"),
    [hrefs]
  );

  useEffect(() => {
    const unique = key ? key.split("\0") : [];
    if (unique.length === 0) return;

    let cancelled = false;
    let i = 0;

    const run = () => {
      if (cancelled || i >= unique.length) return;
      // Prefetch a few per idle slice to avoid flooding the network.
      const batch = unique.slice(i, i + 4);
      i += batch.length;
      for (const href of batch) {
        try {
          router.prefetch(href);
        } catch {
          /* ignore */
        }
      }
      if (i < unique.length) schedule();
    };

    const schedule = () => {
      if (typeof window === "undefined") return;
      const ric = (
        window as Window & {
          requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        }
      ).requestIdleCallback;
      if (typeof ric === "function") {
        ric(run, { timeout: 2500 });
      } else {
        globalThis.setTimeout(run, 400);
      }
    };

    schedule();
    return () => {
      cancelled = true;
    };
  }, [key, router]);

  return null;
}
