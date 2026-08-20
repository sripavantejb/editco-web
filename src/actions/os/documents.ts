"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity } from "@/lib/os/activity";
import { bool, str } from "@/lib/os/form";
import { OsDocument } from "@/models/os/Document";
import { Project } from "@/models/os/Project";
import { Vendor } from "@/models/os/Vendor";
import type { ActionState } from "@/actions/auth";

export async function uploadDocument(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("documents:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const title = str(formData, "title");
  const conversionUuid = str(formData, "conversionUuid");
  if (!title || !conversionUuid) return { error: "Title and conversion are required" };

  const file = formData.get("file");
  let fileName = "";
  let mimeType = "";
  let dataBase64 = "";
  if (file instanceof File && file.size > 0) {
    if (file.size > 6 * 1024 * 1024) return { error: "File must be under 6MB" };
    const buf = Buffer.from(await file.arrayBuffer());
    fileName = file.name;
    mimeType = file.type || "application/octet-stream";
    dataBase64 = buf.toString("base64");
  }

  const projectId = str(formData, "projectId");
  const project = projectId ? await Project.findById(projectId) : null;
  const vendor = await Vendor.findOne({ conversionUuid });

  const doc = await OsDocument.create({
    conversionUuid,
    projectId: project?._id,
    vendorId: vendor?._id,
    title,
    fileName,
    mimeType,
    dataBase64,
    visibleToClient: bool(formData, "visibleToClient"),
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  await logActivity({
    title: "Document uploaded",
    detail: title,
    createdBy: gate.staff.email,
    conversionUuid,
    projectId: projectId || undefined,
    entityType: "document",
    entityId: doc._id.toString(),
  });

  revalidatePath("/admin/os", "layout");
  return { success: "Document saved" };
}

export async function toggleDocumentVisibility(formData: FormData) {
  const gate = await requireStaff("documents:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const doc = await OsDocument.findById(str(formData, "id"));
  if (!doc) return { error: "Not found" };
  doc.visibleToClient = !doc.visibleToClient;
  doc.updatedBy = gate.staff.email;
  await doc.save();
  revalidatePath("/admin/os", "layout");
  return { success: "Updated" };
}
