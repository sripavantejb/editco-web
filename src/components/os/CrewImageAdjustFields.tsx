"use client";

import { Field, osInputClass } from "@/components/os/ui";

/** Scale + focal point for crew circular crop. */
export function CrewImageAdjustFields({
  scale = 1,
  posX = 50,
  posY = 18,
}: {
  scale?: number;
  posX?: number;
  posY?: number;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-[var(--dash-border)] bg-white p-3">
      <p className="font-inter text-xs font-medium text-[var(--dash-text)]">
        Adjust crop
        <span className="ml-1 font-normal text-[var(--dash-muted)]">
          — zoom and move the face inside the circle
        </span>
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Zoom (0.6–2.5)">
          <input
            name="imageScale"
            type="number"
            step="0.05"
            min="0.6"
            max="2.5"
            defaultValue={scale}
            className={osInputClass()}
          />
        </Field>
        <Field label="Move left ↔ right %">
          <input
            name="imagePosX"
            type="number"
            step="1"
            min="0"
            max="100"
            defaultValue={posX}
            className={osInputClass()}
          />
        </Field>
        <Field label="Move up ↕ down %">
          <input
            name="imagePosY"
            type="number"
            step="1"
            min="0"
            max="100"
            defaultValue={posY}
            className={osInputClass()}
          />
        </Field>
      </div>
      <p className="font-inter text-[11px] text-[var(--dash-muted)]">
        Tip: lower “up/down %” shows more of the top of the photo (face). Higher zoom fills the circle.
      </p>
    </div>
  );
}
