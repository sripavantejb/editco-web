"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity } from "@/lib/os/activity";
import { str } from "@/lib/os/form";
import {
  VAULT_MESSAGE_TYPES,
  VAULT_PROJECT_STATUSES,
  type VaultMessageType,
  type VaultProjectStatus,
} from "@/lib/os/constants";
import { encryptSecret, decryptSecret, hasEncryptedSecret } from "@/lib/os/vault-crypto";
import { isValidHttpUrl, slugifyVaultName } from "@/lib/os/message-template";
import { VaultProject } from "@/models/os/VaultProject";
import { VaultProjectMessage } from "@/models/os/VaultProjectMessage";
import type { ActionState } from "@/actions/auth";

function revalidateVault(id?: string) {
  revalidatePath("/admin/os/projects-vault", "layout");
  revalidatePath("/admin/os/leads", "layout");
  if (id) revalidatePath(`/admin/os/projects-vault/${id}`, "layout");
}

const urlOptional = z
  .string()
  .optional()
  .refine((v) => !v || isValidHttpUrl(v), "URL must start with http:// or https://");

const createSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  localUrl: urlOptional,
  productionUrl: z
    .string()
    .min(1, "Production URL is required")
    .refine(isValidHttpUrl, "Production URL must be a valid http(s) URL"),
  loginEmail: z.string().email().optional().or(z.literal("")),
  password: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(VAULT_PROJECT_STATUSES).optional(),
  whatsappCold: z.string().optional(),
  emailSubject: z.string().optional(),
  emailBody: z.string().optional(),
  followUp: z.string().optional(),
  linkedin: z.string().optional(),
  generalPitch: z.string().optional(),
  internalNotes: z.string().optional(),
  targetIndustry: z.string().optional(),
  idealCustomer: z.string().optional(),
  sellingPoints: z.string().optional(),
  commonObjections: z.string().optional(),
  bestPitchAngle: z.string().optional(),
  pricingNotes: z.string().optional(),
  competitors: z.string().optional(),
  demoNotes: z.string().optional(),
});

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = slugifyVaultName(base) || "project";
  let n = 0;
  for (;;) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const q: Record<string, unknown> = { slug: candidate };
    if (excludeId) q._id = { $ne: excludeId };
    const exists = await VaultProject.findOne(q).select({ _id: 1 }).lean();
    if (!exists) return candidate;
    n += 1;
  }
}

async function upsertDefaultMessages(
  projectId: string,
  data: {
    whatsappCold?: string;
    emailSubject?: string;
    emailBody?: string;
    followUp?: string;
    linkedin?: string;
    generalPitch?: string;
  },
  updatedBy: string
) {
  const entries: { type: VaultMessageType; subject: string; body: string }[] = [
    { type: "whatsapp_cold", subject: "", body: data.whatsappCold || "" },
    {
      type: "email",
      subject: data.emailSubject || "",
      body: data.emailBody || "",
    },
    { type: "follow_up", subject: "", body: data.followUp || "" },
    { type: "linkedin", subject: "", body: data.linkedin || "" },
    { type: "general_pitch", subject: "", body: data.generalPitch || "" },
  ];
  for (const e of entries) {
    if (!e.body && !e.subject) continue;
    await VaultProjectMessage.findOneAndUpdate(
      { projectId, type: e.type },
      {
        $set: {
          subject: e.subject,
          body: e.body,
          updatedBy,
        },
        $setOnInsert: { projectId, type: e.type },
      },
      { upsert: true }
    );
  }
}

export async function createVaultProject(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("vault:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const parsed = createSchema.safeParse({
    name: str(formData, "name"),
    localUrl: str(formData, "localUrl") || undefined,
    productionUrl: str(formData, "productionUrl"),
    loginEmail: str(formData, "loginEmail"),
    password: str(formData, "password") || undefined,
    description: str(formData, "description") || undefined,
    category: str(formData, "category") || undefined,
    status: (str(formData, "status") || "active") as VaultProjectStatus,
    whatsappCold: str(formData, "whatsappCold") || undefined,
    emailSubject: str(formData, "emailSubject") || undefined,
    emailBody: str(formData, "emailBody") || undefined,
    followUp: str(formData, "followUp") || undefined,
    linkedin: str(formData, "linkedin") || undefined,
    generalPitch: str(formData, "generalPitch") || undefined,
    internalNotes: str(formData, "internalNotes") || undefined,
    targetIndustry: str(formData, "targetIndustry") || undefined,
    idealCustomer: str(formData, "idealCustomer") || undefined,
    sellingPoints: str(formData, "sellingPoints") || undefined,
    commonObjections: str(formData, "commonObjections") || undefined,
    bestPitchAngle: str(formData, "bestPitchAngle") || undefined,
    pricingNotes: str(formData, "pricingNotes") || undefined,
    competitors: str(formData, "competitors") || undefined,
    demoNotes: str(formData, "demoNotes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid project" };
  }

  const slug = await uniqueSlug(parsed.data.name);
  const enc = parsed.data.password
    ? encryptSecret(parsed.data.password)
    : null;

  const project = await VaultProject.create({
    name: parsed.data.name,
    slug,
    localUrl: parsed.data.localUrl || "",
    productionUrl: parsed.data.productionUrl,
    loginEmail: parsed.data.loginEmail || "",
    passwordCipher: enc?.cipher || "",
    passwordIv: enc?.iv || "",
    passwordTag: enc?.tag || "",
    description: parsed.data.description || "",
    category: parsed.data.category || "",
    status: parsed.data.status || "active",
    internalNotes: parsed.data.internalNotes || "",
    targetIndustry: parsed.data.targetIndustry || "",
    idealCustomer: parsed.data.idealCustomer || "",
    sellingPoints: parsed.data.sellingPoints || "",
    commonObjections: parsed.data.commonObjections || "",
    bestPitchAngle: parsed.data.bestPitchAngle || "",
    pricingNotes: parsed.data.pricingNotes || "",
    competitors: parsed.data.competitors || "",
    demoNotes: parsed.data.demoNotes || "",
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  await upsertDefaultMessages(
    project._id.toString(),
    parsed.data,
    gate.staff.email
  );

  await logActivity({
    title: "Vault project created",
    detail: project.name,
    createdBy: gate.staff.email,
    entityType: "vault_project",
    entityId: project._id.toString(),
  });

  revalidateVault(project._id.toString());
  redirect(`/admin/os/projects-vault/${project._id}`);
}

export async function updateVaultProject(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("vault:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const id = str(formData, "id");
  const project = await VaultProject.findById(id);
  if (!project || project.recordStatus !== "active") {
    return { error: "Project not found" };
  }

  const parsed = createSchema.safeParse({
    name: str(formData, "name"),
    localUrl: str(formData, "localUrl") || undefined,
    productionUrl: str(formData, "productionUrl"),
    loginEmail: str(formData, "loginEmail"),
    password: str(formData, "password") || undefined,
    description: str(formData, "description") || undefined,
    category: str(formData, "category") || undefined,
    status: (str(formData, "status") || project.status) as VaultProjectStatus,
    internalNotes: str(formData, "internalNotes") || undefined,
    targetIndustry: str(formData, "targetIndustry") || undefined,
    idealCustomer: str(formData, "idealCustomer") || undefined,
    sellingPoints: str(formData, "sellingPoints") || undefined,
    commonObjections: str(formData, "commonObjections") || undefined,
    bestPitchAngle: str(formData, "bestPitchAngle") || undefined,
    pricingNotes: str(formData, "pricingNotes") || undefined,
    competitors: str(formData, "competitors") || undefined,
    demoNotes: str(formData, "demoNotes") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid project" };
  }

  const nameChanged = project.name !== parsed.data.name;
  if (nameChanged) {
    project.slug = await uniqueSlug(parsed.data.name, id);
  }

  const urlChanged = project.productionUrl !== parsed.data.productionUrl;
  const emailChanged = project.loginEmail !== (parsed.data.loginEmail || "");

  project.name = parsed.data.name;
  project.localUrl = parsed.data.localUrl || "";
  project.productionUrl = parsed.data.productionUrl;
  project.loginEmail = parsed.data.loginEmail || "";
  project.description = parsed.data.description || "";
  project.category = parsed.data.category || "";
  project.status = parsed.data.status || project.status;
  project.internalNotes = parsed.data.internalNotes || "";
  project.targetIndustry = parsed.data.targetIndustry || "";
  project.idealCustomer = parsed.data.idealCustomer || "";
  project.sellingPoints = parsed.data.sellingPoints || "";
  project.commonObjections = parsed.data.commonObjections || "";
  project.bestPitchAngle = parsed.data.bestPitchAngle || "";
  project.pricingNotes = parsed.data.pricingNotes || "";
  project.competitors = parsed.data.competitors || "";
  project.demoNotes = parsed.data.demoNotes || "";
  project.updatedBy = gate.staff.email;

  let credentialsUpdated = false;
  if (parsed.data.password) {
    const enc = encryptSecret(parsed.data.password);
    if (enc) {
      project.passwordCipher = enc.cipher;
      project.passwordIv = enc.iv;
      project.passwordTag = enc.tag;
      credentialsUpdated = true;
    }
  }
  if (boolClearPassword(formData)) {
    project.passwordCipher = "";
    project.passwordIv = "";
    project.passwordTag = "";
    credentialsUpdated = true;
  }

  await project.save();

  await logActivity({
    title: credentialsUpdated
      ? "Vault project credentials updated"
      : urlChanged
        ? "Vault project production URL updated"
        : "Vault project updated",
    detail: project.name,
    createdBy: gate.staff.email,
    entityType: "vault_project",
    entityId: id,
  });
  if (emailChanged && !credentialsUpdated) {
    await logActivity({
      title: "Vault project login email updated",
      detail: project.name,
      createdBy: gate.staff.email,
      entityType: "vault_project",
      entityId: id,
    });
  }

  revalidateVault(id);
  return { success: "Project saved" };
}

function boolClearPassword(formData: FormData) {
  const v = formData.get("clearPassword");
  return v === "on" || v === "true" || v === "1";
}

export async function setVaultProjectStatus(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("vault:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const id = str(formData, "id");
  const status = str(formData, "status") as VaultProjectStatus;
  if (!VAULT_PROJECT_STATUSES.includes(status)) {
    return { error: "Invalid status" };
  }
  const project = await VaultProject.findById(id);
  if (!project || project.recordStatus !== "active") {
    return { error: "Project not found" };
  }
  project.status = status;
  project.updatedBy = gate.staff.email;
  await project.save();
  await logActivity({
    title: `Vault project status → ${status}`,
    detail: project.name,
    createdBy: gate.staff.email,
    entityType: "vault_project",
    entityId: id,
  });
  revalidateVault(id);
  return { success: "Status updated" };
}

export async function archiveVaultProject(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("vault:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const id = str(formData, "id");
  const project = await VaultProject.findById(id);
  if (!project) return { error: "Project not found" };
  project.status = "archived";
  project.recordStatus = "archived";
  project.updatedBy = gate.staff.email;
  await project.save();
  await logActivity({
    title: "Vault project deleted",
    detail: project.name,
    createdBy: gate.staff.email,
    entityType: "vault_project",
    entityId: id,
  });
  revalidateVault();
  return { success: "Vault project deleted" };
}

export async function updateVaultProjectMessages(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("vault:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const id = str(formData, "id");
  const project = await VaultProject.findById(id);
  if (!project || project.recordStatus !== "active") {
    return { error: "Project not found" };
  }

  for (const type of VAULT_MESSAGE_TYPES) {
    const body = str(formData, `msg_${type}`);
    const subject =
      type === "email" ? str(formData, "msg_email_subject") : "";
    await VaultProjectMessage.findOneAndUpdate(
      { projectId: id, type },
      {
        $set: { body, subject, updatedBy: gate.staff.email },
        $setOnInsert: { projectId: id, type },
      },
      { upsert: true }
    );
  }

  await logActivity({
    title: "Vault project messages updated",
    detail: project.name,
    createdBy: gate.staff.email,
    entityType: "vault_project",
    entityId: id,
  });
  revalidateVault(id);
  return { success: "Messages saved" };
}

export type RevealPasswordResult = ActionState & { password?: string };

export async function revealVaultPassword(
  projectId: string
): Promise<RevealPasswordResult> {
  const gate = await requireStaff("vault:credentials");
  if (!gate.ok) {
    return { error: "You do not have permission to view credentials" };
  }
  await connectDB();
  const project = await VaultProject.findById(projectId).select({
    passwordCipher: 1,
    passwordIv: 1,
    passwordTag: 1,
    recordStatus: 1,
  });
  if (!project || project.recordStatus !== "active") {
    return { error: "Project not found" };
  }
  if (!hasEncryptedSecret(project)) {
    return { error: "No password configured" };
  }
  const password = decryptSecret({
    cipher: project.passwordCipher,
    iv: project.passwordIv,
    tag: project.passwordTag,
  });
  if (!password) return { error: "Could not decrypt password" };
  return { success: "ok", password };
}
