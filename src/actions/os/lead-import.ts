"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity } from "@/lib/os/activity";
import { parseCsv, rowsToObjects } from "@/lib/os/csv";
import {
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  type LeadPriority,
  type LeadSource,
  type LeadStatus,
} from "@/lib/os/constants";
import { Lead } from "@/models/os/Lead";
import { LeadActivity } from "@/models/os/LeadActivity";
import { ServiceCatalog } from "@/models/os/ServiceCatalog";
import type { ActionState } from "@/actions/auth";

const MAX_ROWS = 500;

const rowSchema = z.object({
  name: z.string().min(2, "Lead name is required"),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  source: z.enum(LEAD_SOURCES).optional(),
  industry: z.string().optional(),
  sector: z.string().optional(),
  interestedServices: z.array(z.string()).optional(),
  requirement: z.string().optional(),
  estimatedValue: z.number().optional(),
  assignedOwner: z.string().optional(),
  status: z.enum(LEAD_STATUSES).optional(),
  priority: z.enum(LEAD_PRIORITIES).optional(),
  notes: z.string().optional(),
});

export type LeadImportResult = ActionState & {
  created?: number;
  skipped?: number;
  errors?: { row: number; reason: string }[];
};

function splitServices(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(/[|;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function mapServices(
  tokens: string[],
  catalog: { slug: string; name: string }[]
): string[] {
  const bySlug = new Map(catalog.map((c) => [c.slug.toLowerCase(), c.slug]));
  const byName = new Map(
    catalog.map((c) => [c.name.toLowerCase(), c.slug])
  );
  return tokens.map((t) => {
    const key = t.toLowerCase();
    return bySlug.get(key) || byName.get(key) || t;
  });
}

function cell(rec: Record<string, string>, key: string): string {
  return (rec[key] ?? "").trim();
}

export async function importLeadsCsv(
  _prev: LeadImportResult,
  formData: FormData
): Promise<LeadImportResult> {
  const gate = await requireStaff("leads:write");
  if (!gate.ok) return { error: gate.error };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose a CSV file to upload" };
  }
  if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
    return { error: "Upload a .csv file (export from Excel as CSV)" };
  }

  const text = await file.text();
  if (!text.trim()) return { error: "CSV file is empty" };

  const { headers, records } = rowsToObjects(parseCsv(text));
  if (headers.length === 0) return { error: "CSV has no header row" };
  if (!headers.includes("name")) {
    return {
      error: 'CSV must include a "name" column. Download the template for the expected headers.',
    };
  }
  if (records.length > MAX_ROWS) {
    return {
      error: `Too many rows (${records.length}). Maximum is ${MAX_ROWS} per upload.`,
    };
  }
  if (records.length === 0) return { error: "CSV has no data rows" };

  await connectDB();

  const services = await ServiceCatalog.find({ isActive: true })
    .select({ slug: 1, name: 1 })
    .lean();
  const catalog = services.map((s) => ({
    slug: s.slug,
    name: s.name,
  }));

  const phones = [
    ...new Set(
      records
        .map((r) => cell(r, "phone"))
        .filter((p) => p.length > 0)
    ),
  ];
  const emails = [
    ...new Set(
      records
        .map((r) => cell(r, "email").toLowerCase())
        .filter((e) => e.length > 0)
    ),
  ];

  const orClauses: Record<string, unknown>[] = [];
  if (phones.length) orClauses.push({ phone: { $in: phones } });
  if (emails.length) orClauses.push({ email: { $in: emails } });

  const existing =
    orClauses.length > 0
      ? await Lead.find({
          recordStatus: "active",
          $or: orClauses,
        })
          .select({ phone: 1, email: 1 })
          .lean()
      : [];

  const existingPhones = new Set(
    existing.map((e) => (e.phone || "").trim()).filter(Boolean)
  );
  const existingEmails = new Set(
    existing.map((e) => (e.email || "").trim().toLowerCase()).filter(Boolean)
  );

  const errors: { row: number; reason: string }[] = [];
  const toInsert: Record<string, unknown>[] = [];
  let skipped = 0;

  // Track phones/emails within this file to avoid duplicate inserts
  const batchPhones = new Set<string>();
  const batchEmails = new Set<string>();

  for (let i = 0; i < records.length; i++) {
    const rowNum = i + 2; // 1-based + header
    const rec = records[i];
    const name = cell(rec, "name");
    const phone = cell(rec, "phone");
    const emailRaw = cell(rec, "email").toLowerCase();
    const sourceRaw = cell(rec, "source") || "cold";
    const statusRaw = cell(rec, "status") || "new";
    const priorityRaw = cell(rec, "priority") || "medium";
    const valueRaw = cell(rec, "estimatedValue");
    const estimatedValue = valueRaw ? Number(valueRaw.replace(/,/g, "")) : 0;

    if (phone && (existingPhones.has(phone) || batchPhones.has(phone))) {
      skipped += 1;
      errors.push({
        row: rowNum,
        reason: `Skipped duplicate phone: ${phone}`,
      });
      continue;
    }
    if (emailRaw && (existingEmails.has(emailRaw) || batchEmails.has(emailRaw))) {
      skipped += 1;
      errors.push({
        row: rowNum,
        reason: `Skipped duplicate email: ${emailRaw}`,
      });
      continue;
    }

    if (valueRaw && Number.isNaN(estimatedValue)) {
      errors.push({ row: rowNum, reason: "estimatedValue must be a number" });
      continue;
    }

    const interestedServices = mapServices(
      splitServices(cell(rec, "interestedServices")),
      catalog
    );

    const parsed = rowSchema.safeParse({
      name,
      company: cell(rec, "company") || undefined,
      phone: phone || undefined,
      email: emailRaw || "",
      source: sourceRaw as LeadSource,
      industry: cell(rec, "industry") || undefined,
      sector: cell(rec, "sector") || undefined,
      interestedServices,
      requirement: cell(rec, "requirement") || undefined,
      estimatedValue: estimatedValue || undefined,
      assignedOwner:
        cell(rec, "assignedOwner") || gate.staff.name || undefined,
      status: statusRaw as LeadStatus,
      priority: priorityRaw as LeadPriority,
      notes: cell(rec, "notes") || undefined,
    });

    if (!parsed.success) {
      errors.push({
        row: rowNum,
        reason: parsed.error.issues[0]?.message || "Invalid row",
      });
      continue;
    }

    const data = parsed.data;
    toInsert.push({
      name: data.name,
      company: data.company || "",
      phone: data.phone || "",
      email: data.email || "",
      source: data.source || "cold",
      industry: data.industry || "",
      sector: data.sector || "",
      interestedServices: data.interestedServices || [],
      requirement: data.requirement || "",
      estimatedValue: data.estimatedValue || 0,
      assignedOwner: data.assignedOwner || gate.staff.name,
      status: data.status || "new",
      priority: data.priority || "medium",
      notes: data.notes || "",
      recordStatus: "active",
      createdBy: gate.staff.email,
      updatedBy: gate.staff.email,
    });

    if (phone) batchPhones.add(phone);
    if (emailRaw) batchEmails.add(emailRaw);
  }

  let created = 0;
  if (toInsert.length > 0) {
    const inserted = await Lead.insertMany(toInsert, { ordered: false });
    created = inserted.length;

    await LeadActivity.insertMany(
      inserted.map((lead) => ({
        leadId: lead._id,
        eventType: "created",
        toStatus: lead.status,
        reason: "Bulk CSV import",
        expectedValue: lead.estimatedValue,
        createdBy: gate.staff.email,
      }))
    );

    await logActivity({
      title: "Leads imported",
      detail: `Imported ${created} lead${created === 1 ? "" : "s"} from CSV${
        skipped ? ` · ${skipped} skipped` : ""
      }`,
      createdBy: gate.staff.email,
      entityType: "lead",
    });
  }

  revalidatePath("/admin/os", "layout");
  revalidatePath("/admin/os/leads", "layout");
  revalidatePath("/admin/os/pipeline", "layout");
  revalidatePath("/admin/os/calling", "layout");

  const validationErrors = errors.filter(
    (e) => !e.reason.startsWith("Skipped duplicate")
  );
  const skipMessages = errors.filter((e) =>
    e.reason.startsWith("Skipped duplicate")
  );

  if (created === 0 && validationErrors.length > 0 && skipMessages.length === 0) {
    return {
      error: "No leads imported. Fix the row errors and try again.",
      created: 0,
      skipped: 0,
      errors: validationErrors.slice(0, 50),
    };
  }

  return {
    success:
      created > 0
        ? `Imported ${created} lead${created === 1 ? "" : "s"}${
            skipped ? ` · ${skipped} skipped as duplicates` : ""
          }${
            validationErrors.length
              ? ` · ${validationErrors.length} row error${
                  validationErrors.length === 1 ? "" : "s"
                }`
              : ""
          }`
        : skipped > 0
          ? `No new leads created. ${skipped} duplicate${
              skipped === 1 ? "" : "s"
            } skipped.`
          : "No leads imported",
    created,
    skipped,
    errors: errors.slice(0, 50),
  };
}
