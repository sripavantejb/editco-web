import { connectDB } from "@/lib/db";
import {
  DEFAULT_INDUSTRIES,
  DEFAULT_SERVICES,
} from "@/lib/os/constants";
import { IndustryCatalog } from "@/models/os/IndustryCatalog";
import { ServiceCatalog } from "@/models/os/ServiceCatalog";

/** Seed default industries + services once catalogs are empty / missing defaults. */
export async function ensureOsCatalogs() {
  await connectDB();

  await Promise.all(
    DEFAULT_INDUSTRIES.map((item) =>
      IndustryCatalog.updateOne(
        { slug: item.slug },
        {
          $setOnInsert: {
            slug: item.slug,
            name: item.name,
            sector: item.sector,
            isActive: true,
          },
        },
        { upsert: true }
      )
    )
  );

  await Promise.all(
    DEFAULT_SERVICES.map((item) =>
      ServiceCatalog.updateOne(
        { slug: item.slug },
        {
          $setOnInsert: {
            slug: item.slug,
            name: item.name,
            isActive: true,
          },
        },
        { upsert: true }
      )
    )
  );
}

export function slugifyLabel(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
}
