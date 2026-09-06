import { cache } from "react";
import { connectDB } from "@/lib/db";
import { AdminUser } from "@/models/AdminUser";
import { StaffUser } from "@/models/os/StaffUser";
import { ServiceCatalog } from "@/models/os/ServiceCatalog";
import { EGA_ADMIN_EMAILS, ensureAdminSeeded } from "@/lib/admin";
import { DEFAULT_SERVICES, type StaffRole } from "@/lib/os/constants";
import { hashPassword } from "@/lib/os/password";
import { permissionsForRole } from "@/lib/os/permissions";
import { SUPER_ADMIN_EMAILS, isSuperAdminEmail } from "@/lib/os/super-admin";

export const LEGACY_ADMIN_PASSWORD = "editcomedia@DHT";
export const LEGACY_EGA_PASSWORD = "abc@123";

/** Seeded team members (idempotent by email). Passwords from OS_SEED_TEAM_PASSWORD only. */
export const SEEDED_TEAM_MEMBERS: { name: string; email: string; role: StaffRole }[] = [
  {
    name: "Harsha",
    email: "harshapolina1@gmail.com",
    role: "super_admin",
  },
  {
    name: "Tej",
    email: "sripavantejb@gmail.com",
    role: "super_admin",
  },
  {
    name: "Deepika",
    email: "deepikamundla54@gmail.com",
    role: "super_admin",
  },
];

export type StaffContext = {
  email: string;
  userId: string;
  role: StaffRole;
  permissions: string[];
  name: string;
};

/**
 * This does a full pass of admin/staff/service-catalog upserts (several DB round trips,
 * including writes) — idempotent, but far too expensive to redo on every single request.
 * loadStaffByEmail() calls this at the top of EVERY OS page/action, so without this guard
 * every navigation in Super Admin was paying for the whole reseed before its own queries
 * even started. Only actually run it once per warm server instance.
 */
let seededOnce = false;

export async function ensureOsSeeded() {
  // connectDB() must be awaited by every caller regardless of the guard below — it's cheap
  // once the connection promise is cached, but skipping it on a concurrent cold-start request
  // means that request's very first query runs before the connection is actually ready.
  await connectDB();
  if (seededOnce) return;
  seededOnce = true;
  await ensureAdminSeeded();

  const fromEnv = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const emails = [...new Set([...fromEnv, ...EGA_ADMIN_EMAILS])];

  for (const email of emails) {
    const existing = await StaffUser.findOne({ email });
    if (existing) continue;
    const isEga = EGA_ADMIN_EMAILS.includes(email);
    // Only the hard allowlist may be super_admin; everyone else seeds as admin.
    const role: StaffRole = isSuperAdminEmail(email) ? "super_admin" : "admin";
    await StaffUser.create({
      email,
      name: email.split("@")[0],
      role,
      isActive: true,
      passwordHash: hashPassword(
        isEga ? LEGACY_EGA_PASSWORD : LEGACY_ADMIN_PASSWORD
      ),
    });
  }

  const admins = await AdminUser.find({}).lean();
  for (const admin of admins) {
    const email = admin.email.toLowerCase();
    const existing = await StaffUser.findOne({ email });
    if (existing) continue;
    const role: StaffRole = isSuperAdminEmail(email) ? "super_admin" : "admin";
    await StaffUser.create({
      email,
      name: email.split("@")[0],
      role,
      isActive: true,
      passwordHash: hashPassword(LEGACY_ADMIN_PASSWORD),
    });
  }

  // Same default as Deepika (EGA admin): abc@123. Override with OS_SEED_TEAM_PASSWORD if set.
  const teamPassword =
    (process.env.OS_SEED_TEAM_PASSWORD || "").trim() || LEGACY_EGA_PASSWORD;
  for (const member of SEEDED_TEAM_MEMBERS) {
    const email = member.email.toLowerCase();
    try {
      const existing = await StaffUser.findOne({ email });
      if (existing) {
        if (!existing.name) existing.name = member.name;
        // SEEDED_TEAM_MEMBERS is the source of truth for these specific owner
        // accounts, so always sync — not just when the stored role is invalid.
        existing.role = member.role;
        if (!existing.passwordHash || existing.passwordHash === "") {
          existing.passwordHash = hashPassword(teamPassword);
        }
        await existing.save();
        continue;
      }
      await StaffUser.create({
        email,
        name: member.name,
        role: member.role,
        isActive: true,
        passwordHash: hashPassword(teamPassword),
      });
    } catch (err) {
      console.error(`[os] Failed to seed staff user ${email}:`, err);
    }
  }

  // Enforce allowlist: anyone else previously seeded as super_admin is demoted.
  await StaffUser.updateMany(
    {
      role: "super_admin",
      email: { $nin: [...SUPER_ADMIN_EMAILS] },
    },
    { $set: { role: "admin" } }
  );

  for (const service of DEFAULT_SERVICES) {
    await ServiceCatalog.updateOne(
      { slug: service.slug },
      { $setOnInsert: { name: service.name, isActive: true } },
      { upsert: true }
    );
  }
}

/** Deduped per RSC request — layout + page share one staff document. */
export const loadStaffByEmail = cache(async (email: string): Promise<StaffContext | null> => {
  await ensureOsSeeded();
  const staff = await StaffUser.findOne({
    email: email.toLowerCase().trim(),
    isActive: true,
  })
    .select("_id email name role")
    .lean<{ _id: { toString(): string }; email: string; name?: string; role: string }>();
  if (!staff) return null;
  const role = staff.role as StaffRole;
  return {
    email: staff.email,
    userId: staff._id.toString(),
    role,
    permissions: permissionsForRole(role),
    name: staff.name || staff.email,
  };
});

export async function touchLastLogin(userId: string) {
  await connectDB();
  await StaffUser.updateOne(
    { _id: userId },
    { $set: { lastLoginAt: new Date() } }
  );
}
