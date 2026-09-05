import { connectDB } from "@/lib/db";
import { SalesEmployee, type SalesEmployeeDoc } from "@/models/sales/SalesEmployee";
import { SalesPermissionOverride } from "@/models/sales/SalesPermissionOverride";
import { StaffUser } from "@/models/os/StaffUser";
import {
  SALES_MODULE_KEYS,
  defaultModuleMapForRole,
  type SalesModuleKey,
} from "@/lib/sales/modules";
import "@/models/sales/register";

export type SalesEmployeeContext = {
  employeeId: string;
  staffUserId: string;
  email: string;
  name: string;
  isSalesAdmin: boolean;
  status: SalesEmployeeDoc["status"];
};

export async function getSalesEmployeeContext(email: string): Promise<SalesEmployeeContext | null> {
  await connectDB();
  const staff = await StaffUser.findOne({ email: email.toLowerCase().trim(), isActive: true });
  if (!staff) return null;
  const employee = await SalesEmployee.findOne({ staffUserId: staff._id });
  if (!employee || employee.status !== "active") return null;
  return {
    employeeId: employee._id.toString(),
    staffUserId: staff._id.toString(),
    email: staff.email,
    name: staff.name || staff.email,
    isSalesAdmin: employee.isSalesAdmin,
    status: employee.status,
  };
}

/** Role default merged with this employee's explicit overrides. Override always wins. */
export async function getEffectiveSalesPermissions(
  employeeId: string,
  isSalesAdmin: boolean
): Promise<Record<SalesModuleKey, boolean>> {
  await connectDB();
  const effective = defaultModuleMapForRole(isSalesAdmin);
  const overrideDoc = await SalesPermissionOverride.findOne({ salesEmployeeId: employeeId }).lean();
  if (overrideDoc?.overrides) {
    const map = overrideDoc.overrides as unknown as Map<string, boolean>;
    for (const [key, value] of map instanceof Map ? map.entries() : Object.entries(map)) {
      if ((SALES_MODULE_KEYS as readonly string[]).includes(key)) {
        effective[key as SalesModuleKey] = Boolean(value);
      }
    }
  }
  return effective;
}

export function hasSalesModule(effective: Record<SalesModuleKey, boolean>, key: SalesModuleKey) {
  return Boolean(effective[key]);
}
