"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { EGAFormConfig } from "@/models/EGAFormConfig";
import type { ActionState } from "@/actions/auth";
import {
  defaultEGAFormConfig,
  EGA_QUESTION_TYPES,
  type EGAFormConfigData,
  type EGAQuestion,
} from "@/lib/ega-form";

const questionSchema = z.object({
  name: z.string().min(1),
  section: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  type: z.enum(EGA_QUESTION_TYPES),
  label: z.string().min(1, "Question text is required"),
  helpText: z.string().optional().default(""),
  placeholder: z.string().optional().default(""),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  max: z.number().optional(),
  scaleLow: z.string().optional(),
  scaleHigh: z.string().optional(),
});

const copySchema = z.object({
  introKicker: z.string(),
  introTitle: z.string().min(1, "Intro title is required"),
  introMinutes: z.string(),
  introBody: z.string(),
  introBullets: z.array(z.string()),
  sectionTitles: z.object({
    1: z.string(),
    2: z.string(),
    3: z.string(),
    4: z.string(),
    5: z.string(),
  }),
});

export async function getEGAFormConfig(): Promise<EGAFormConfigData> {
  const fallback = defaultEGAFormConfig();
  try {
    await connectDB();
    const doc = await EGAFormConfig.findOne({ key: "default" }).lean();
    if (!doc?.questions?.length) return fallback;
    return {
      copy: {
        ...fallback.copy,
        ...(doc.copy || {}),
        sectionTitles: {
          ...fallback.copy.sectionTitles,
          ...(doc.copy?.sectionTitles || {}),
        },
      },
      questions: doc.questions as EGAQuestion[],
    };
  } catch {
    return fallback;
  }
}

export async function saveEGAFormConfig(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getAdminSession();
  if (!session) return { error: "Unauthorized" };

  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("config") || "{}"));
  } catch {
    return { error: "Invalid form data" };
  }

  const parsed = z
    .object({ copy: copySchema, questions: z.array(questionSchema).min(1) })
    .safeParse(payload);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Invalid questions" };
  }

  for (const q of parsed.data.questions) {
    if (
      (q.type === "select" || q.type === "radio" || q.type === "multi_checkbox") &&
      (!q.options || q.options.length === 0)
    ) {
      return { error: `"${q.label}" needs at least one option` };
    }
  }

  await connectDB();
  await EGAFormConfig.updateOne(
    { key: "default" },
    {
      $set: {
        key: "default",
        copy: parsed.data.copy,
        questions: parsed.data.questions,
      },
    },
    { upsert: true }
  );

  revalidatePath("/admin/ega/form");
  revalidatePath("/editco-growth-associate");
  revalidatePath("/ega");
  return { success: "Form questions saved. The public apply page now uses them." };
}
