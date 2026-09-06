"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity } from "@/lib/os/activity";
import { num, str } from "@/lib/os/form";
import {
  ensureSiteContentSeeded,
  readUploadedImage,
} from "@/lib/site-content";
import { SiteClientLogo } from "@/models/os/SiteClientLogo";
import { SiteCrewMember } from "@/models/os/SiteCrewMember";
import { SiteWork } from "@/models/os/SiteWork";
import type { ActionState } from "@/actions/auth";

function revalidateSite() {
  revalidatePath("/");
  revalidatePath("/work");
  revalidatePath("/admin/os/settings/website");
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function upsertSiteClientLogo(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  await ensureSiteContentSeeded();

  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!title) return { error: "Title is required" };

  let uploaded: { base64: string; mimeType: string } | null = null;
  try {
    uploaded = await readUploadedImage(formData, "image");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }

  const payload = {
    title,
    href: str(formData, "href"),
    alt: str(formData, "alt") || title,
    card: str(formData, "card") === "dark" ? "dark" : "light",
    scale: num(formData, "scale") || 1.2,
    sortOrder: num(formData, "sortOrder"),
    imageUrl: str(formData, "imageUrl"),
    updatedBy: gate.staff.email,
  };

  let doc = id ? await SiteClientLogo.findById(id) : null;
  if (doc) {
    Object.assign(doc, payload);
    if (uploaded) {
      doc.imageBase64 = uploaded.base64;
      doc.mimeType = uploaded.mimeType;
      doc.imageUrl = "";
    } else if (payload.imageUrl) {
      doc.imageBase64 = "";
      doc.mimeType = "";
    }
    await doc.save();
  } else {
    doc = await SiteClientLogo.create({
      ...payload,
      imageBase64: uploaded?.base64 || "",
      mimeType: uploaded?.mimeType || "",
      createdBy: gate.staff.email,
    });
  }

  await logActivity({
    title: id ? "Client logo updated" : "Client logo added",
    detail: title,
    createdBy: gate.staff.email,
    entityType: "site_client_logo",
    entityId: doc._id.toString(),
  });

  revalidateSite();
  return { success: id ? "Client logo saved" : "Client logo added" };
}

export async function archiveSiteClientLogo(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const doc = await SiteClientLogo.findById(str(formData, "id"));
  if (!doc || doc.recordStatus !== "active") return { error: "Not found" };
  doc.recordStatus = "archived";
  doc.updatedBy = gate.staff.email;
  await doc.save();
  revalidateSite();
  return { success: "Client logo removed" };
}

export async function upsertSiteWork(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  await ensureSiteContentSeeded();

  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!title) return { error: "Title is required" };

  const slugRaw = str(formData, "slug") || title;
  const slug = slugify(slugRaw);
  if (!slug) return { error: "Slug is required" };

  let uploaded: { base64: string; mimeType: string } | null = null;
  try {
    uploaded = await readUploadedImage(formData, "image");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }

  const focus = str(formData, "focus")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const payload = {
    slug,
    title,
    location: str(formData, "location"),
    category: str(formData, "category"),
    fullWidth: str(formData, "fullWidth") === "true",
    problem: str(formData, "problem"),
    approach: str(formData, "approach"),
    outcome: str(formData, "outcome"),
    focus,
    sortOrder: num(formData, "sortOrder"),
    imageUrl: str(formData, "imageUrl"),
    updatedBy: gate.staff.email,
  };

  const existingSlug = await SiteWork.findOne({
    slug,
    ...(id ? { _id: { $ne: id } } : {}),
  });
  if (existingSlug) return { error: "That slug is already used" };

  let doc = id ? await SiteWork.findById(id) : null;
  if (doc) {
    Object.assign(doc, payload);
    if (uploaded) {
      doc.imageBase64 = uploaded.base64;
      doc.mimeType = uploaded.mimeType;
      doc.imageUrl = "";
    } else if (payload.imageUrl) {
      doc.imageBase64 = "";
      doc.mimeType = "";
    }
    await doc.save();
  } else {
    doc = await SiteWork.create({
      ...payload,
      imageBase64: uploaded?.base64 || "",
      mimeType: uploaded?.mimeType || "",
      createdBy: gate.staff.email,
    });
  }

  await logActivity({
    title: id ? "Selected work updated" : "Selected work added",
    detail: title,
    createdBy: gate.staff.email,
    entityType: "site_work",
    entityId: doc._id.toString(),
  });

  revalidateSite();
  revalidatePath(`/work/${slug}`);
  return { success: id ? "Work saved" : "Work added" };
}

export async function archiveSiteWork(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const doc = await SiteWork.findById(str(formData, "id"));
  if (!doc || doc.recordStatus !== "active") return { error: "Not found" };
  doc.recordStatus = "archived";
  doc.updatedBy = gate.staff.email;
  await doc.save();
  revalidateSite();
  return { success: "Work removed" };
}

export async function upsertSiteCrewMember(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  await ensureSiteContentSeeded();

  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) return { error: "Name is required" };

  const slugRaw = str(formData, "slug") || name;
  const slug = slugify(slugRaw);
  if (!slug) return { error: "Slug is required" };

  const accentRaw = str(formData, "accent");
  const accent =
    accentRaw === "green" || accentRaw === "purple" ? accentRaw : "orange";

  let uploaded: { base64: string; mimeType: string } | null = null;
  try {
    uploaded = await readUploadedImage(formData, "image");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }

  const payload = {
    slug,
    name,
    role: str(formData, "role"),
    description: str(formData, "description"),
    accent,
    linkedin: str(formData, "linkedin"),
    portfolio: str(formData, "portfolio"),
    sortOrder: num(formData, "sortOrder"),
    imageUrl: str(formData, "imageUrl"),
    updatedBy: gate.staff.email,
  };

  const existingSlug = await SiteCrewMember.findOne({
    slug,
    ...(id ? { _id: { $ne: id } } : {}),
  });
  if (existingSlug) return { error: "That slug is already used" };

  let doc = id ? await SiteCrewMember.findById(id) : null;
  if (doc) {
    Object.assign(doc, payload);
    if (uploaded) {
      doc.imageBase64 = uploaded.base64;
      doc.mimeType = uploaded.mimeType;
      doc.imageUrl = "";
    } else if (payload.imageUrl) {
      doc.imageBase64 = "";
      doc.mimeType = "";
    }
    await doc.save();
  } else {
    doc = await SiteCrewMember.create({
      ...payload,
      imageBase64: uploaded?.base64 || "",
      mimeType: uploaded?.mimeType || "",
      createdBy: gate.staff.email,
    });
  }

  await logActivity({
    title: id ? "Crew member updated" : "Crew member added",
    detail: name,
    createdBy: gate.staff.email,
    entityType: "site_crew",
    entityId: doc._id.toString(),
  });

  revalidateSite();
  return { success: id ? "Crew member saved" : "Crew member added" };
}

export async function archiveSiteCrewMember(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("*");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const doc = await SiteCrewMember.findById(str(formData, "id"));
  if (!doc || doc.recordStatus !== "active") return { error: "Not found" };
  doc.recordStatus = "archived";
  doc.updatedBy = gate.staff.email;
  await doc.save();
  revalidateSite();
  return { success: "Crew member removed" };
}
