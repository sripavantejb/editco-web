export type RichSegment =
  | { type: "text"; value: string }
  | { type: "link"; href: string; label: string };

export function richText(...parts: RichSegment[]): RichSegment[] {
  return parts;
}

/** Flatten rich segments for schema / plain-text fallbacks. */
export function segmentsToPlainText(segments: readonly RichSegment[]): string {
  return segments
    .map((segment) =>
      segment.type === "text" ? segment.value : segment.label
    )
    .join("");
}
