import { cache } from "react";
import { connectDB } from "@/lib/db";
import { SalesEmployee, type SalesEmployeeDoc } from "@/models/sales/SalesEmployee";
import { SalesPermissionOverride } from "@/models/sales/SalesPermissionOverride";
import { StaffUser } from "@/models/os/StaffUser";
import {
  SALES_MODULE_KEYS,
  defaultModuleMapForRole,
  type SalesModuleKey,
} from "@/lib/sales/modules";
import { applyEmployeePortalPolicy } from "@/lib/sales/portal";
import { isSuperAdminEmail } from "@/lib/os/super-admin";
import "@/models/sales/register";

export type SalesEmployeeContext = {
  employeeId: string;
  staffUserId: string;
  email: string;
  name: string;
  isSalesAdmin: boolean;
  status: SalesEmployeeDoc["status"];
};

/** Warm-instance TTL so consecutive portal navigations skip repeat Staff/Employee lookups. */
const CONTEXT_TTL_MS = 20_000;
const PERMS_TTL_MS = 20_000;
type Ttl<T> = { value: T; expires: number };
const contextTtl = new Map<string, Ttl<SalesEmployeeContext | null>>();
const permsTtl = new Map<string, Ttl<Record<SalesModuleKey, boolean>>>();

/** Deduped per RSC request — layout + page share one sales context. */
export const getSalesEmployeeContext = cache(
  async (email: string): Promise<SalesEmployeeContext | null> => {
    const normalized = email.toLowerCase().trim();
    const hit = contextTtl.get(normalized);
    if (hit && hit.expires > Date.now()) return hit.value;

    await connectDB();
    const staff = await StaffUser.findOne({ email: normalized, isActive: true })
      .select("_id email name")
      .lean<{ _id: { toString(): string }; email: string; name?: string }>();
    if (!staff) {
      contextTtl.set(normalized, { value: null, expires: Date.now() + CONTEXT_TTL_MS });
      return null;
    }
    const employee = await SalesEmployee.findOne({ staffUserId: staff._id })
      .select("_id isSalesAdmin status")
      .lean<{
        _id: { toString(): string };
        isSalesAdmin: boolean;
        status: SalesEmployeeDoc["status"];
      }>();
    if (!employee || employee.status !== "active") {
      contextTtl.set(normalized, { value: null, expires: Date.now() + CONTEXT_TTL_MS });
      return null;
    }
    const value: SalesEmployeeContext = {
      employeeId: employee._id.toString(),
      staffUserId: staff._id.toString(),
      email: staff.email,
      name: staff.name || staff.email,
      isSalesAdmin: employee.isSalesAdmin,
      status: employee.status,
    };
    contextTtl.set(normalized, { value, expires: Date.now() + CONTEXT_TTL_MS });
    return value;
  }
);

/**
 * Super admins can jump into Sales Admin. Cached per request; only writes
 * when the SalesEmployee row is missing or not admin/active.
 */
export const ensureSuperAdminSalesAccess = cache(
  async (email: string): Promise<SalesEmployeeContext | null> => {
    if (!isSuperAdminEmail(email)) return null;
    await connectDB();
    const normalized = email.toLowerCase().trim();
    const staff = await StaffUser.findOne({ email: normalized, isActive: true })
      .select("_id email name")
      .lean<{ _id: { toString(): string }; email: string; name?: string }>();
    if (!staff) return null;

    const existing = await SalesEmployee.findOne({ staffUserId: staff._id })
      .select("_id isSalesAdmin status")
      .lean<{
        _id: { toString(): string };
        isSalesAdmin: boolean;
        status: SalesEmployeeDoc["status"];
      }>();

    if (existing?.isSalesAdmin && existing.status === "active") {
      return {
        employeeId: existing._id.toString(),
        staffUserId: staff._id.toString(),
        email: staff.email,
        name: staff.name || staff.email,
        isSalesAdmin: true,
        status: existing.status,
      };
    }

    if (!existing) {
      const created = await SalesEmployee.create({
        staffUserId: staff._id,
        employeeCode: `SA-${staff._id.toString().slice(-4).toUpperCase()}`,
        isSalesAdmin: true,
        department: "Sales",
        team: "Owners",
        status: "active",
        createdBy: "super_admin_jump",
        updatedBy: "super_admin_jump",
      });
      return {
        employeeId: created._id.toString(),
        staffUserId: staff._id.toString(),
        email: staff.email,
        name: staff.name || staff.email,
        isSalesAdmin: true,
        status: "active",
      };
    }

    await SalesEmployee.updateOne(
      { _id: existing._id },
      {
        $set: {
          isSalesAdmin: true,
          status: "active",
          updatedBy: "super_admin_jump",
        },
      }
    );

    return {
      employeeId: existing._id.toString(),
      staffUserId: staff._id.toString(),
      email: staff.email,
      name: staff.name || staff.email,
      isSalesAdmin: true,
      status: "active",
    };
  }
);

/** Role default merged with this employee's explicit overrides. Cached per request. */
export const getEffectiveSalesPermissions = cache(
  async (
    employeeId: string,
    isSalesAdmin: boolean
  ): Promise<Record<SalesModuleKey, boolean>> => {
    const cacheKey = `${employeeId}:${isSalesAdmin ? "1" : "0"}`;
    const hit = permsTtl.get(cacheKey);
    if (hit && hit.expires > Date.now()) return hit.value;

    await connectDB();
    const effective = defaultModuleMapForRole(isSalesAdmin);
    if (isSalesAdmin) {
      permsTtl.set(cacheKey, { value: effective, expires: Date.now() + PERMS_TTL_MS });
      return effective;
    }

    const overrideDoc = await SalesPermissionOverride.findOne({ salesEmployeeId: employeeId })
      .select("overrides")
      .lean();
    if (overrideDoc?.overrides) {
      const map = overrideDoc.overrides as unknown as Map<string, boolean>;
      for (const [key, value] of map instanceof Map ? map.entries() : Object.entries(map)) {
        if ((SALES_MODULE_KEYS as readonly string[]).includes(key)) {
          effective[key as SalesModuleKey] = Boolean(value);
        }
      }
    }
    const value = applyEmployeePortalPolicy(effective);
    permsTtl.set(cacheKey, { value, expires: Date.now() + PERMS_TTL_MS });
    return value;
  }
);

/** Call after permission editor saves so the next nav picks up new modules immediately. */
export function invalidateSalesPermissionCache(employeeId?: string) {
  if (!employeeId) {
    permsTtl.clear();
    return;
  }
  for (const key of permsTtl.keys()) {
    if (key.startsWith(`${employeeId}:`)) permsTtl.delete(key);
  }
}

export function hasSalesModule(effective: Record<SalesModuleKey, boolean>, key: SalesModuleKey) {
  return Boolean(effective[key]);
}
