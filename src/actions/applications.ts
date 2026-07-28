"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { Job } from "@/models/Job";
import { JobApplication } from "@/models/JobApplication";
import {
  APPLICATION_STATUSES,
  JOB_FILE_MAX_MB,
  type FormFieldType,
} from "@/lib/constants";
import {
  denormalizeApplicant,
  isFileAnswer,
  type ApplicationAnswer,
  type FileAnswerValue,
  type FormFieldDef,
} from "@/lib/jobs";
import type { ActionState } from "@/actions/auth";

const ALLOWED_FILE_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

async function fileToAnswer(
  file: File,
  maxMb: number
): Promise<FileAnswerValue | { error: string }> {
  if (file.size <= 0) return { error: "Empty file" };
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    return { error: `File must be under ${maxMb}MB` };
  }
  const mime = file.type || "application/octet-stream";
  const nameLower = file.name.toLowerCase();
  const okExt =
    nameLower.endsWith(".pdf") ||
    nameLower.endsWith(".doc") ||
    nameLower.endsWith(".docx");
  if (!ALLOWED_FILE_MIMES.has(mime) && !okExt) {
    return { error: "Only PDF or Word documents are allowed" };
  }
  const buf = Buffer.from(await file.arrayBuffer());
  return {
    name: file.name,
    mimeType: mime,
    size: file.size,
    dataBase64: buf.toString("base64"),
  };
}

function collectMulti(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((v) => String(v))
    .filter(Boolean);
}

async function buildAnswersFromForm(
  fields: FormFieldDef[],
  formData: FormData
): Promise<{ answers?: ApplicationAnswer[]; error?: string }> {
  const answers: ApplicationAnswer[] = [];

  for (const field of fields) {
    const key = `field_${field.id}`;

    if (field.type === "file") {
      const file = formData.get(key);
      if (!(file instanceof File) || file.size === 0) {
        if (field.required) return { error: `${field.label} is required` };
        continue;
      }
      const result = await fileToAnswer(file, field.maxSizeMb || JOB_FILE_MAX_MB);
      if ("error" in result) return { error: `${field.label}: ${result.error}` };
      answers.push({
        fieldId: field.id,
        label: field.label,
        type: field.type,
        value: result,
      });
      continue;
    }

    if (field.type === "checkbox") {
      const checked = formData.get(key) === "on" || formData.get(key) === "true";
      if (field.required && !checked) {
        return { error: `${field.label} is required` };
      }
      answers.push({
        fieldId: field.id,
        label: field.label,
        type: field.type,
        value: checked,
      });
      continue;
    }

    if (field.type === "multi_checkbox") {
      const values = collectMulti(formData, key);
      if (field.required && values.length === 0) {
        return { error: `${field.label} is required` };
      }
      answers.push({
        fieldId: field.id,
        label: field.label,
        type: field.type,
        value: values,
      });
      continue;
    }

    const raw = String(formData.get(key) ?? "").trim();
    if (!raw) {
      if (field.required) return { error: `${field.label} is required` };
      continue;
    }

    if (field.type === "email") {
      const ok = z.string().email().safeParse(raw);
      if (!ok.success) return { error: `Invalid email for ${field.label}` };
    }
    if (field.type === "url") {
      const ok = z.string().url().safeParse(raw);
      if (!ok.success) return { error: `Invalid URL for ${field.label}` };
    }
    if (field.type === "number" && Number.isNaN(Number(raw))) {
      return { error: `${field.label} must be a number` };
    }
    if (
      (field.type === "select" || field.type === "radio") &&
      field.options &&
      !field.options.some((o) => o.value === raw)
    ) {
      return { error: `Invalid option for ${field.label}` };
    }

    answers.push({
      fieldId: field.id,
      label: field.label,
      type: field.type as FormFieldType,
      value: raw,
    });
  }

  return { answers };
}

export async function submitJobApplication(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const jobId = String(formData.get("jobId") || "");
  if (!jobId) return { error: "Missing job" };

  await connectDB();
  const job = await Job.findById(jobId).lean();
  if (!job || job.status !== "published") {
    return { error: "This role is not accepting applications" };
  }

  const fields = (job.formFields || []) as FormFieldDef[];
  const built = await buildAnswersFromForm(fields, formData);
  if (built.error || !built.answers) {
    return { error: built.error || "Invalid application" };
  }

  const { applicantName, applicantEmail } = denormalizeApplicant(built.answers);

  await JobApplication.create({
    jobId: job._id,
    jobTitle: job.title,
    status: "new",
    applicantName,
    applicantEmail,
    answers: built.answers,
  });

  revalidatePath(`/admin/jobs/${jobId}/applications`);
  revalidatePath("/admin/jobs");
  return { success: "Application submitted — we'll be in touch." };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: (typeof APPLICATION_STATUSES)[number]
): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };
  if (!APPLICATION_STATUSES.includes(status)) return { error: "Invalid status" };

  await connectDB();
  const app = await JobApplication.findById(applicationId);
  if (!app) return { error: "Application not found" };

  app.status = status;
  await app.save();

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath(`/admin/jobs/${app.jobId}/applications`);
  return { success: "Status updated" };
}

export async function updateApplicationNotes(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  const applicationId = String(formData.get("applicationId") || "");
  const adminNotes = String(formData.get("adminNotes") || "");
  if (!applicationId) return { error: "Missing application" };

  await connectDB();
  const app = await JobApplication.findById(applicationId);
  if (!app) return { error: "Application not found" };

  app.adminNotes = adminNotes;
  await app.save();

  revalidatePath(`/admin/applications/${applicationId}`);
  return { success: "Notes saved" };
}

export async function deleteApplication(
  applicationId: string
): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  await connectDB();
  const app = await JobApplication.findById(applicationId);
  if (!app) return { error: "Application not found" };

  const jobId = String(app.jobId);
  await JobApplication.deleteOne({ _id: app._id });

  revalidatePath(`/admin/jobs/${jobId}/applications`);
  revalidatePath("/admin/jobs");
  redirect(`/admin/jobs/${jobId}/applications`);
}

/** Serialize file answer for download without sending huge props from list pages. */
export async function getApplicationFilePayload(
  applicationId: string,
  fieldId: string
): Promise<FileAnswerValue | null> {
  const session = await getAdminSession();
  if (!session) return null;

  await connectDB();
  const app = await JobApplication.findById(applicationId).lean();
  if (!app) return null;

  const answer = (app.answers || []).find(
    (a: { fieldId: string; value: unknown }) => a.fieldId === fieldId
  );
  if (!answer || !isFileAnswer(answer.value)) return null;
  return answer.value;
}
