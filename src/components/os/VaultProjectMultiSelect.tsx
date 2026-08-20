"use client";

import { useMemo, useState } from "react";
import { osInputClass } from "@/components/os/ui";

export type VaultProjectOption = { id: string; name: string; category?: string };

export function VaultProjectMultiSelect({
  projects,
  name = "vaultProjectIds",
  initialSelected = [],
}: {
  projects: VaultProjectOption[];
  name?: string;
  initialSelected?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
    );
  }, [projects, query]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="space-y-3">
      <p className="font-inter text-xs text-[var(--dash-muted)]">
        Projects pitched
      </p>
      {selected.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}
      <div className="flex flex-wrap gap-2">
        {selected.map((id) => {
          const p = projects.find((x) => x.id === id);
          if (!p) return null;
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--dash-accent)] bg-[var(--dash-accent-soft)] px-3 py-1.5 font-inter text-sm text-[var(--dash-accent)]"
            >
              {p.name}
              <span aria-hidden>×</span>
            </button>
          );
        })}
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search projects…"
        className={osInputClass()}
      />
      <div className="max-h-40 overflow-auto rounded-xl border border-[var(--dash-border)] p-2">
        {filtered.length === 0 ? (
          <p className="p-2 font-inter text-xs text-[var(--dash-muted)]">
            No active vault projects match.
          </p>
        ) : (
          filtered.map((p) => {
            const on = selected.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-inter text-sm ${
                  on
                    ? "bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]"
                    : "text-[var(--dash-text)] hover:bg-[var(--dash-hover)]"
                }`}
              >
                <span>{p.name}</span>
                {p.category ? (
                  <span className="text-xs text-[var(--dash-muted)]">
                    {p.category}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
