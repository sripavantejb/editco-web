import { connectDB } from "@/lib/db";
import { AdminUser } from "@/models/AdminUser";

export async function ensureAdminSeeded() {
  await connectDB();
  const emails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

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
