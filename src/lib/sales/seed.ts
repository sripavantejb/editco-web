import { connectDB } from "@/lib/db";
import { StaffUser } from "@/models/os/StaffUser";
import { SalesEmployee } from "@/models/sales/SalesEmployee";
import { hashPassword } from "@/lib/os/password";
import "@/models/sales/register";

/**
 * Dev-only convenience: creates one Sales Admin and two Sales Employees so the
 * permission editor / sidebar gating can be exercised without a real HR import.
 * Idempotent by email. Password comes from SALES_SEED_PASSWORD, default "sales@123".
 * Once-per-process guard — never re-run on every login.
 */
let salesDemoSeededOnce = false;

export async function ensureSalesDemoSeeded() {
  if (salesDemoSeededOnce) return;
  // Skip in production unless explicitly enabled — demo accounts are for local/dev.
  if (process.env.NODE_ENV === "production" && process.env.SALES_SEED_IN_PROD !== "1") {
    salesDemoSeededOnce = true;
    return;
  }

  await connectDB();
  salesDemoSeededOnce = true;

  const password = (process.env.SALES_SEED_PASSWORD || "").trim() || "sales@123";
  const demoUsers = [
    { email: "sales.admin@editcomedia.com", name: "Asha Menon (Sales Admin)", isSalesAdmin: true, code: "SA-0001" },
    { email: "sales.rahul@editcomedia.com", name: "Rahul Verma", isSalesAdmin: false, code: "SE-0001" },
    { email: "sales.priya@editcomedia.com", name: "Priya Nair", isSalesAdmin: false, code: "SE-0002" },
  ];

  try {
    await seedDemoUsers(demoUsers, password);
  } catch (err) {
    // A dev convenience seeder must never block sign-in.
    console.error("[sales seed] skipped:", err);
  }
}

async function seedDemoUsers(
  demoUsers: { email: string; name: string; isSalesAdmin: boolean; code: string }[],
  password: string
) {
  for (const u of demoUsers) {
    let staffId: { toString(): string } | null = null;
    const existingStaff = await StaffUser.findOne({ email: u.email }).select("_id").lean();
    if (existingStaff) {
      staffId = existingStaff._id;
    } else {
      const created = await StaffUser.create({
        email: u.email,
        name: u.name,
        role: "sales",
        isActive: true,
        passwordHash: hashPassword(password),
      });
      staffId = created._id;
    }
    // Already a sales employee — nothing to do, whatever code the row carries.
    const existing = await SalesEmployee.findOne({ staffUserId: staffId }).select("_id").lean();
    if (existing) continue;

    // employeeCode is unique too, so an orphan row holding this code (demo StaffUser
    // deleted and recreated with a new _id) would trip E11000 on create. Repoint it
    // instead — safe here because no row owns this staffUserId.
    const orphan = await SalesEmployee.findOne({ employeeCode: u.code }).select("_id").lean();
    if (orphan) {
      await SalesEmployee.updateOne(
        { _id: orphan._id },
        { $set: { staffUserId: staffId, isSalesAdmin: u.isSalesAdmin, status: "active", updatedBy: "seed" } }
      );
      continue;
    }

    await SalesEmployee.create({
      staffUserId: staffId,
      employeeCode: u.code,
      isSalesAdmin: u.isSalesAdmin,
      department: "Sales",
      team: "Core",
      status: "active",
      createdBy: "seed",
      updatedBy: "seed",
    });
  }
}
