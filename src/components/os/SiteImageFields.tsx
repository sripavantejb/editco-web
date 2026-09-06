"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { Field, osInputClass } from "@/components/os/ui";

/**
 * Shared image controls for Website images admin.
 * Used on every Clients / Works / Crew add & edit form.
 */
export function SiteImageFields({
  currentSrc,
  urlPlaceholder = "/path/or https://…",
  defaultUrl = "",
  label = "Image",
}: {
  currentSrc?: string;
  urlPlaceholder?: string;
  defaultUrl?: string;
  label?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-[var(--dash-border)] bg-[var(--dash-input)]/40 p-3">
      <p className="font-inter text-xs font-medium text-[var(--dash-text)]">
        {label}
        <span className="ml-1 font-normal text-[var(--dash-muted)]">
          — upload a file or paste a URL
        </span>
      </p>

      {(preview || currentSrc) && (
        <div className="relative mx-auto flex h-28 w-full max-w-[220px] items-center justify-center overflow-hidden rounded-xl bg-[#f5f5f5]">
          <Image
            src={preview || currentSrc!}
            alt="Preview"
            fill
            className="object-contain p-2"
            unoptimized
          />
        </div>
      )}

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-[var(--dash-border)] bg-white px-3 py-5 text-center transition hover:border-[#111111]">
        <ImagePlus className="h-5 w-5 text-[var(--dash-muted)]" strokeWidth={1.75} />
        <span className="font-inter text-xs font-medium text-[var(--dash-text)]">
          {currentSrc || preview ? "Choose new image" : "Add image"}
        </span>
        <span className="font-inter text-[11px] text-[var(--dash-muted)]">
          PNG, JPG, WEBP, GIF, SVG · max 6MB
        </span>
        <input
          name="image"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) {
              setPreview(null);
              return;
            }
            const url = URL.createObjectURL(file);
            setPreview((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return url;
            });
          }}
        />
      </label>

      <Field label="Or image URL / path">
        <input
          name="imageUrl"
          defaultValue={defaultUrl}
          placeholder={urlPlaceholder}
          className={osInputClass()}
        />
      </Field>
    </div>
  );
}
