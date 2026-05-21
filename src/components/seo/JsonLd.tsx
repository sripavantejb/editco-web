type JsonLdProps = {
  /** A single schema object, or multiple objects merged into one @graph. */
  data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Renders JSON-LD structured data. Pass either:
 * - A pre-built graph from `buildGlobalSchemaGraph()` / `buildPageSchemaGraph()`
 * - One or more schema objects (wrapped in @graph automatically)
 */
export function JsonLd({ data }: JsonLdProps) {
  const payload = Array.isArray(data)
    ? data.length === 1 && data[0]["@context"]
      ? data[0]
      : {
          "@context": "https://schema.org",
          "@graph": data,
        }
    : data["@context"]
      ? data
      : data["@graph"]
        ? { "@context": "https://schema.org", ...data }
        : {
            "@context": "https://schema.org",
            "@graph": [data],
          };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
