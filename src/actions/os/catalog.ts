"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { str } from "@/lib/os/form";
import { INDUSTRY_SECTORS, type IndustrySector } from "@/lib/os/constants";
import { slugifyLabel } from "@/lib/os/catalog";
import { IndustryCatalog } from "@/models/os/IndustryCatalog";
import { ServiceCatalog } from "@/models/os/ServiceCatalog";
import type { ActionState } from "@/actions/auth";

export async function createIndustry(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState & { industry?: { slug: string; name: string; sector: string } }> {
  const gate = await requireStaff("leads:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const name = str(formData, "name");
  if (!name) return { error: "Industry name is required" };
  const sectorRaw = str(formData, "sector") || "Other";
  const sector = (INDUSTRY_SECTORS as readonly string[]).includes(sectorRaw)
    ? (sectorRaw as IndustrySector)
    : "Other";
  const slug = slugifyLabel(str(formData, "slug") || name) || `industry_${Date.now()}`;

  await IndustryCatalog.updateOne(
    { slug },
    { name, slug, sector, isActive: true },
    { upsert: true }
  );

  revalidatePath("/admin/os/leads", "layout");
  revalidatePath("/admin/os/analytics");
  return {
    success: "Industry added",
    industry: { slug, name, sector },
  };
}

/** Quick-add service from lead forms (sales-safe). */
export async function createServiceQuick(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState & { service?: { slug: string; name: string } }> {
  const gate = await requireStaff("leads:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const name = str(formData, "name");
  if (!name) return { error: "Service name is required" };
  const slug = slugifyLabel(str(formData, "slug") || name) || `service_${Date.now()}`;

  await ServiceCatalog.updateOne(
    { slug },
    { name, slug, isActive: true },
    { upsert: true }
  );

  revalidatePath("/admin/os/leads", "layout");
  revalidatePath("/admin/os/settings/services");
  return {
    success: "Service added",
    service: { slug, name },
  };
}
