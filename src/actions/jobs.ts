"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { Job } from "@/models/Job";
import { JobApplication } from "@/models/JobApplication";
import {
  EMPLOYMENT_TYPES,
  FORM_FIELD_TYPES,
  JOB_STATUSES,
} from "@/lib/constants";
import {
  defaultJobFormFields,
  fieldNeedsOptions,
  slugify,
  type FormFieldDef,
} from "@/lib/jobs";
import type { ActionState } from "@/actions/auth";

const formFieldSchema = z.object({
  id: z.string().min(1),
  type: z.enum(FORM_FIELD_TYPES),
  label: z.string().min(1, "Field label required"),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  required: z.boolean(),
  options: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .optional(),
  accept: z.string().optional(),
  maxSizeMb: z.number().positive().optional(),
});

const jobDetailsSchema = z.object({
  title: z.string().min(2, "Title is required"),
  department: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  summary: z.string().optional(),
  description: z.string().min(10, "Description is required"),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  status: z.enum(JOB_STATUSES),
});

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) return null;
  return session;
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugify(base) || "role";
  let n = 0;
  for (;;) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const existing = await Job.findOne({
      slug: candidate,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    }).lean();
    if (!existing) return candidate;
    n += 1;
  }
}

function parseFormFieldsJson(raw: FormDataEntryValue | null): FormFieldDef[] {
  if (!raw || typeof raw !== "string") return [];
  const parsed = z.array(formFieldSchema).safeParse(JSON.parse(raw));
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid form fields");
  }
  for (const f of parsed.data) {
    if (fieldNeedsOptions(f.type) && (!f.options || f.options.length === 0)) {
      throw new Error(`"${f.label}" needs at least one option`);
    }
  }
  return parsed.data as FormFieldDef[];
}

export async function createJob(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const details = jobDetailsSchema.safeParse({
    title: formData.get("title"),
    department: formData.get("department") || "",
    location: formData.get("location") || "Remote",
    employmentType: formData.get("employmentType") || "full_time",
    summary: formData.get("summary") || "",
    description: formData.get("description") || "",
    requirements: formData.get("requirements") || "",
    benefits: formData.get("benefits") || "",
    status: formData.get("status") || "draft",
  });

  if (!details.success) {
    return { error: details.error.issues[0]?.message || "Invalid input" };
  }

  let formFields: FormFieldDef[];
  try {
    const raw = formData.get("formFields");
    formFields =
      raw && typeof raw === "string" && raw.length > 2
        ? parseFormFieldsJson(raw)
        : defaultJobFormFields();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Invalid form fields" };
  }

  await connectDB();
  const slug = await uniqueSlug(details.data.title);
  const publishedAt =
    details.data.status === "published" ? new Date() : undefined;

  const job = await Job.create({
    ...details.data,
    slug,
    formFields,
    publishedAt,
  });

  revalidatePath("/admin/jobs");
  revalidatePath("/careers");
  redirect(`/admin/jobs/${job._id}`);
}

export async function updateJob(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const id = String(formData.get("jobId") || "");
  if (!id) return { error: "Missing job id" };

  const details = jobDetailsSchema.safeParse({
    title: formData.get("title"),
    department: formData.get("department") || "",
    location: formData.get("location") || "Remote",
    employmentType: formData.get("employmentType") || "full_time",
    summary: formData.get("summary") || "",
    description: formData.get("description") || "",
    requirements: formData.get("requirements") || "",
    benefits: formData.get("benefits") || "",
    status: formData.get("status") || "draft",
  });

  if (!details.success) {
    return { error: details.error.issues[0]?.message || "Invalid input" };
  }

  let formFields: FormFieldDef[];
  try {
    formFields = parseFormFieldsJson(formData.get("formFields"));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Invalid form fields" };
  }

  await connectDB();
  const job = await Job.findById(id);
  if (!job) return { error: "Job not found" };

  const prevStatus = job.status;
  Object.assign(job, details.data);
  job.formFields = formFields;

  if (details.data.status === "published" && prevStatus !== "published") {
    job.publishedAt = new Date();
  }

  await job.save();

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${id}`);
  revalidatePath("/careers");
  revalidatePath(`/careers/${job.slug}`);
  return { success: "Job saved" };
}

export async function setJobStatus(
  jobId: string,
  status: (typeof JOB_STATUSES)[number]
): Promise<ActionState> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };
  if (!JOB_STATUSES.includes(status)) return { error: "Invalid status" };

  await connectDB();
  const job = await Job.findById(jobId);
  if (!job) return { error: "Job not found" };

  const prev = job.status;
  job.status = status;
  if (status === "published" && prev !== "published") {
    job.publishedAt = new Date();
  }
  await job.save();

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath("/careers");
  revalidatePath(`/careers/${job.slug}`);
  return { success: "Status updated" };
}

export async function deleteJob(jobId: string): Promise<ActionState> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  await connectDB();
  const job = await Job.findById(jobId);
  if (!job) return { error: "Job not found" };

  const slug = job.slug;
  await JobApplication.deleteMany({ jobId: job._id });
  await Job.deleteOne({ _id: job._id });

  revalidatePath("/admin/jobs");
  revalidatePath("/careers");
  revalidatePath(`/careers/${slug}`);
  redirect("/admin/jobs");
}

export async function saveJobFormFields(
  jobId: string,
  fields: FormFieldDef[]
): Promise<ActionState> {
  if (!(await requireAdmin())) return { error: "Unauthorized" };

  const parsed = z.array(formFieldSchema).safeParse(fields);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid fields" };
  }

  await connectDB();
  const job = await Job.findById(jobId);
  if (!job) return { error: "Job not found" };

  job.formFields = parsed.data as FormFieldDef[];
  await job.save();

  revalidatePath(`/admin/jobs/${jobId}`);
  revalidatePath(`/careers/${job.slug}`);
  return { success: "Form saved" };
}
