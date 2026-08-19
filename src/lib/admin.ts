import { connectDB } from "@/lib/db";
import { AdminUser } from "@/models/AdminUser";

export const EGA_ADMIN_EMAILS = ["deepikamundla54@gmail.com"];

export function isEGAAdminEmail(email: string) {
  return EGA_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export async function ensureAdminSeeded() {
  await connectDB();
  const fromEnv = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const emails = [...new Set([...fromEnv, ...EGA_ADMIN_EMAILS])];

  for (const email of emails) {
    await AdminUser.updateOne({ email }, { email }, { upsert: true });
  }
}

export async function isAdminEmail(email: string) {
  await ensureAdminSeeded();
  const found = await AdminUser.findOne({
    email: email.toLowerCase().trim(),
  }).lean();
  return Boolean(found);
}
