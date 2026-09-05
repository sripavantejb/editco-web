import { connectDB } from "@/lib/db";
import { AdminUser } from "@/models/AdminUser";
import { StaffUser } from "@/models/os/StaffUser";
import { ServiceCatalog } from "@/models/os/ServiceCatalog";
import { EGA_ADMIN_EMAILS, ensureAdminSeeded } from "@/lib/admin";
import { DEFAULT_SERVICES, type StaffRole } from "@/lib/os/constants";
import { hashPassword } from "@/lib/os/password";
import { permissionsForRole } from "@/lib/os/permissions";

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
    email: "bsripavantej@gmail.com",
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

export async function ensureOsSeeded() {
  await ensureAdminSeeded();
  await connectDB();

  const fromEnv = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const emails = [...new Set([...fromEnv, ...EGA_ADMIN_EMAILS])];

  for (const email of emails) {
    const existing = await StaffUser.findOne({ email });
    if (existing) continue;
    const isEga = EGA_ADMIN_EMAILS.includes(email);
    await StaffUser.create({
      email,
      name: email.split("@")[0],
      role: "super_admin",
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
    await StaffUser.create({
      email,
      name: email.split("@")[0],
      role: "super_admin",
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

  for (const service of DEFAULT_SERVICES) {
    await ServiceCatalog.updateOne(
      { slug: service.slug },
      { $setOnInsert: { name: service.name, isActive: true } },
      { upsert: true }
    );
  }
}

export async function loadStaffByEmail(email: string): Promise<StaffContext | null> {
  await ensureOsSeeded();
  const staff = await StaffUser.findOne({
    email: email.toLowerCase().trim(),
    isActive: true,
  });
  if (!staff) return null;
  const role = staff.role as StaffRole;
  return {
    email: staff.email,
    userId: staff._id.toString(),
    role,
    permissions: permissionsForRole(role),
    name: staff.name || staff.email,
  };
}

export async function touchLastLogin(userId: string) {
  await connectDB();
  await StaffUser.updateOne(
    { _id: userId },
    { $set: { lastLoginAt: new Date() } }
  );
}
