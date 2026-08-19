"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { EGAApplication } from "@/models/EGAApplication";
import type { ActionState } from "@/actions/auth";
import {
  AGREEMENT_ITEMS,
  computeEGAScore,
  normalizeServiceChoice,
  EGA_STATUSES,
  normalizeEGAStatus,
  type EGAScoreBreakdown,
  type EGAStatus,
} from "@/lib/ega";

function collectMulti(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((v) => String(v))
    .filter(Boolean);
}

const applicationSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    email: z.string().email("Valid email required"),
    phone: z.string().min(7, "Phone / WhatsApp number is required"),
    college: z.string().min(2, "College / University is required"),
    yearOfStudy: z.string().optional().default(""),
    specialization: z.string().optional().default(""),
    city: z.string().optional().default(""),
    about: z.string().optional().default(""),
    whyAssociate: z.string().optional().default(""),
    interests: z.array(z.string()).default([]),
    knowsOwners: z.string().optional().default(""),
    networkSize: z.string().optional().default(""),
    industries: z.array(z.string()).default([]),
    networkSources: z.array(z.string()).default([]),
    businessTypes: z.string().optional().default(""),
    soldBefore: z.string().optional().default(""),
    salesExperience: z.string().optional().default(""),
    comfortApproach: z.coerce.number().int().min(1).max(5).optional().default(1),
    comfortColdCall: z.coerce.number().int().min(1).max(5).optional().default(1),
    comfortOutreach: z.coerce.number().int().min(1).max(5).optional().default(1),
    restaurantProblems: z.string().optional().default(""),
    websiteObjection: z.string().optional().default(""),
    expensiveObjection: z.string().optional().default(""),
    rejectionResponse: z.string().optional().default(""),
    services: z
      .array(z.string())
      .transform((vals) => vals.map(normalizeServiceChoice))
      .default([]),
    exampleBusiness: z.string().optional().default(""),
    weeklyHours: z.string().optional().default(""),
    performanceBased: z.string().optional().default(""),
    training: z.string().optional().default(""),
    duration: z.string().optional().default(""),
    whySelect: z.string().optional().default(""),
    achievements: z.string().optional().default(""),
    linkedin: z.string().optional().default(""),
    anythingElse: z.string().optional().default(""),
    agreement: z
      .array(z.string())
      .refine(
        (vals) => AGREEMENT_ITEMS.every((item) => vals.includes(item)),
        "Please agree to the Terms and Conditions"
      ),
  })
  .superRefine((data, ctx) => {
    if (data.soldBefore === "Yes" && data.salesExperience.trim().length < 10) {
      ctx.addIssue({
        code: "custom",
        message: "Please briefly describe your sales experience",
        path: ["salesExperience"],
      });
    }
  });

export type EGAListItem = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  city: string;
  yearOfStudy: string;
  specialization: string;
  score: number;
  status: EGAStatus;
  createdAt: string;
};

export type EGADetail = EGAListItem & {
  about: string;
  whyAssociate: string;
  interests: string[];
  knowsOwners: string;
  networkSize: string;
  industries: string[];
  networkSources: string[];
  businessTypes: string;
  soldBefore: string;
  salesExperience: string;
  comfortApproach: number;
  comfortColdCall: number;
  comfortOutreach: number;
  restaurantProblems: string;
  websiteObjection: string;
  expensiveObjection: string;
  rejectionResponse: string;
  services: string[];
  exampleBusiness: string;
  weeklyHours: string;
  performanceBased: string;
  training: string;
  duration: string;
  whySelect: string;
  achievements: string;
  linkedin: string;
  anythingElse: string;
  agreement: string[];
  scoreBreakdown: EGAScoreBreakdown;
};

function toListItem(doc: {
  _id: unknown;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  city?: string;
  yearOfStudy: string;
  specialization: string;
  score: number;
  status: EGAStatus;
  createdAt: Date | string;
}): EGAListItem {
  return {
    id: String(doc._id),
    fullName: doc.fullName,
    email: doc.email,
    phone: doc.phone,
    college: doc.college,
    city: doc.city || "",
    yearOfStudy: doc.yearOfStudy,
    specialization: doc.specialization,
    score: doc.score,
    status: normalizeEGAStatus(doc.status),
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt),
  };
}

export async function submitEGAApplication(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = applicationSchema.safeParse({
    fullName: String(formData.get("fullName") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    college: String(formData.get("college") || "").trim(),
    yearOfStudy: String(formData.get("yearOfStudy") || ""),
    specialization: String(formData.get("specialization") || ""),
    city: String(formData.get("city") || "").trim(),
    about: String(formData.get("about") || "").trim(),
    whyAssociate: String(formData.get("whyAssociate") || "").trim(),
    interests: collectMulti(formData, "interests"),
    knowsOwners: String(formData.get("knowsOwners") || ""),
    networkSize: String(formData.get("networkSize") || ""),
    industries: collectMulti(formData, "industries"),
    networkSources: collectMulti(formData, "networkSources"),
    businessTypes: String(formData.get("businessTypes") || "").trim(),
    soldBefore: String(formData.get("soldBefore") || ""),
    salesExperience: String(formData.get("salesExperience") || "").trim(),
    comfortApproach: formData.get("comfortApproach") || 1,
    comfortColdCall: formData.get("comfortColdCall") || 1,
    comfortOutreach: formData.get("comfortOutreach") || 1,
    restaurantProblems: String(formData.get("restaurantProblems") || "").trim(),
    websiteObjection: String(formData.get("websiteObjection") || "").trim(),
    expensiveObjection: String(formData.get("expensiveObjection") || "").trim(),
    rejectionResponse: String(formData.get("rejectionResponse") || "").trim(),
    services: collectMulti(formData, "services"),
    exampleBusiness:
      formData.get("noExampleYet") === "yes"
        ? String(formData.get("exampleBusiness") || "").trim() ||
          "I don’t have a specific example yet — I want to know more about Editco."
        : String(formData.get("exampleBusiness") || "").trim(),
    weeklyHours: String(formData.get("weeklyHours") || ""),
    performanceBased: String(formData.get("performanceBased") || ""),
    training: String(formData.get("training") || ""),
    duration: String(formData.get("duration") || ""),
    whySelect: String(formData.get("whySelect") || "").trim(),
    achievements: String(formData.get("achievements") || "").trim(),
    linkedin: String(formData.get("linkedin") || "").trim(),
    anythingElse: String(formData.get("anythingElse") || "").trim(),
    agreement:
      formData.get("termsAccepted") === "yes"
        ? [...AGREEMENT_ITEMS]
        : collectMulti(formData, "agreement"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid application" };
  }

  const data = parsed.data;
  const { score, breakdown } = computeEGAScore({
    networkSize: data.networkSize,
    industries: data.industries,
    soldBefore: data.soldBefore,
    salesExperience: data.salesExperience,
    comfortApproach: data.comfortApproach,
    comfortColdCall: data.comfortColdCall,
    comfortOutreach: data.comfortOutreach,
    weeklyHours: data.weeklyHours,
    duration: data.duration,
    interests: data.interests,
    about: data.about,
    whySelect: data.whySelect,
    websiteObjection: data.websiteObjection,
    rejectionResponse: data.rejectionResponse,
  });

  try {
    await connectDB();
    await EGAApplication.create({
      ...data,
      status: "pending",
      score,
      scoreBreakdown: breakdown,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("MONGODB_URI")) {
      return {
        error:
          "Database is not configured. Add MONGODB_URI to your .env.local file and restart the dev server.",
      };
    }
    return { error: "Could not save your application. Please try again." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/ega");
  revalidatePath("/editco-growth-associate");
  return { success: "Application received" };
}

export async function updateEGAStatus(
  id: string,
  status: EGAStatus
): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };
  if (!EGA_STATUSES.includes(status)) return { error: "Invalid status" };

  await connectDB();
  try {
    const updated = await EGAApplication.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: false }
    );
    if (!updated) return { error: "Application not found" };
  } catch {
    return { error: "Could not update status. Try again." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/ega");
  revalidatePath("/editco-growth-associate");
  revalidatePath(`/admin/ega/${id}`);
  return { success: "Status updated" };
}

const adminEditSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone is required"),
  college: z.string().min(2, "College is required"),
  city: z.string().optional().default(""),
  yearOfStudy: z.string().min(1, "Year of study is required"),
  specialization: z.string().min(1, "Specialization is required"),
  about: z.string().optional().default(""),
  whyAssociate: z.string().optional().default(""),
  interests: z.array(z.string()).default([]),
  knowsOwners: z.string().min(1, "Knows owners is required"),
  networkSize: z.string().min(1, "Network size is required"),
  industries: z.array(z.string()).default([]),
  networkSources: z.array(z.string()).default([]),
  businessTypes: z.string().optional().default(""),
  soldBefore: z.string().min(1, "Sold before is required"),
  salesExperience: z.string().optional().default(""),
  comfortApproach: z.coerce.number().int().min(1).max(5),
  comfortColdCall: z.coerce.number().int().min(1).max(5),
  comfortOutreach: z.coerce.number().int().min(1).max(5),
  restaurantProblems: z.string().optional().default(""),
  websiteObjection: z.string().optional().default(""),
  expensiveObjection: z.string().optional().default(""),
  rejectionResponse: z.string().optional().default(""),
  services: z
    .array(z.string())
    .transform((vals) => vals.map(normalizeServiceChoice)),
  exampleBusiness: z.string().optional().default(""),
  weeklyHours: z.string().min(1, "Weekly hours is required"),
  performanceBased: z.string().min(1, "Performance-based answer is required"),
  training: z.string().min(1, "Training answer is required"),
  duration: z.string().min(1, "Duration is required"),
  whySelect: z.string().optional().default(""),
  achievements: z.string().optional().default(""),
  linkedin: z.string().optional().default(""),
  anythingElse: z.string().optional().default(""),
});

export async function updateEGAProfile(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = adminEditSchema.safeParse({
    id: String(formData.get("id") || ""),
    fullName: String(formData.get("fullName") || "").trim(),
    email: String(formData.get("email") || "").trim().toLowerCase(),
    phone: String(formData.get("phone") || "").trim(),
    college: String(formData.get("college") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    yearOfStudy: String(formData.get("yearOfStudy") || "").trim(),
    specialization: String(formData.get("specialization") || "").trim(),
    about: String(formData.get("about") || "").trim(),
    whyAssociate: String(formData.get("whyAssociate") || "").trim(),
    interests: collectMulti(formData, "interests").slice(0, 3),
    knowsOwners: String(formData.get("knowsOwners") || "").trim(),
    networkSize: String(formData.get("networkSize") || "").trim(),
    industries: collectMulti(formData, "industries"),
    networkSources: collectMulti(formData, "networkSources"),
    businessTypes: String(formData.get("businessTypes") || "").trim(),
    soldBefore: String(formData.get("soldBefore") || "").trim(),
    salesExperience: String(formData.get("salesExperience") || "").trim(),
    comfortApproach: formData.get("comfortApproach"),
    comfortColdCall: formData.get("comfortColdCall"),
    comfortOutreach: formData.get("comfortOutreach"),
    restaurantProblems: String(formData.get("restaurantProblems") || "").trim(),
    websiteObjection: String(formData.get("websiteObjection") || "").trim(),
    expensiveObjection: String(formData.get("expensiveObjection") || "").trim(),
    rejectionResponse: String(formData.get("rejectionResponse") || "").trim(),
    services: collectMulti(formData, "services"),
    exampleBusiness: String(formData.get("exampleBusiness") || "").trim(),
    weeklyHours: String(formData.get("weeklyHours") || "").trim(),
    performanceBased: String(formData.get("performanceBased") || "").trim(),
    training: String(formData.get("training") || "").trim(),
    duration: String(formData.get("duration") || "").trim(),
    whySelect: String(formData.get("whySelect") || "").trim(),
    achievements: String(formData.get("achievements") || "").trim(),
    linkedin: String(formData.get("linkedin") || "").trim(),
    anythingElse: String(formData.get("anythingElse") || "").trim(),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid application" };
  }

  const { id, ...fields } = parsed.data;
  const { score, breakdown } = computeEGAScore({
    networkSize: fields.networkSize,
    industries: fields.industries,
    soldBefore: fields.soldBefore,
    salesExperience: fields.salesExperience,
    comfortApproach: fields.comfortApproach,
    comfortColdCall: fields.comfortColdCall,
    comfortOutreach: fields.comfortOutreach,
    weeklyHours: fields.weeklyHours,
    duration: fields.duration,
    interests: fields.interests,
    about: fields.about,
    whySelect: fields.whySelect,
    websiteObjection: fields.websiteObjection,
    rejectionResponse: fields.rejectionResponse,
  });

  await connectDB();
  try {
    const updated = await EGAApplication.findByIdAndUpdate(
      id,
      {
        $set: {
          ...fields,
          score,
          scoreBreakdown: breakdown,
        },
      },
      { new: true, runValidators: false }
    );
    if (!updated) return { error: "Application not found" };
  } catch {
    return { error: "Could not save application. Try again." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/ega");
  revalidatePath("/editco-growth-associate");
  revalidatePath(`/admin/ega/${id}`);
  return { success: "Application saved" };
}

export async function getEGAApplications(): Promise<EGAListItem[]> {
  const session = await getAdminSession();
  if (!session) return [];

  await connectDB();
  const apps = await EGAApplication.find()
    .sort({ createdAt: -1 })
    .select(
      "fullName email phone college city yearOfStudy specialization score status createdAt"
    )
    .lean();

  return apps.map((a) => toListItem(a as Parameters<typeof toListItem>[0]));
}

export async function getEGAApplication(id: string): Promise<EGADetail | null> {
  const session = await getAdminSession();
  if (!session) return null;

  await connectDB();
  const app = await EGAApplication.findById(id).lean();
  if (!app) return null;

  return {
    ...toListItem(app as Parameters<typeof toListItem>[0]),
    about: app.about,
    whyAssociate: app.whyAssociate,
    interests: app.interests || [],
    knowsOwners: app.knowsOwners,
    networkSize: app.networkSize,
    industries: app.industries || [],
    networkSources: app.networkSources || [],
    businessTypes: app.businessTypes || "",
    soldBefore: app.soldBefore,
    salesExperience: app.salesExperience || "",
    comfortApproach: app.comfortApproach,
    comfortColdCall: app.comfortColdCall,
    comfortOutreach: app.comfortOutreach,
    restaurantProblems: app.restaurantProblems,
    websiteObjection: app.websiteObjection,
    expensiveObjection: app.expensiveObjection,
    rejectionResponse: app.rejectionResponse,
    services: app.services || [],
    exampleBusiness: app.exampleBusiness || "",
    weeklyHours: app.weeklyHours,
    performanceBased: app.performanceBased,
    training: app.training,
    duration: app.duration,
    whySelect: app.whySelect,
    achievements: app.achievements || "",
    linkedin: app.linkedin || "",
    anythingElse: app.anythingElse || "",
    agreement: app.agreement || [],
    scoreBreakdown: (app.scoreBreakdown || {}) as EGAScoreBreakdown,
  };
}
