import { describe, expect, it } from "vitest";
import { defaultModuleMapForRole, DEFAULT_EMPLOYEE_MODULES, SALES_MODULE_KEYS } from "@/lib/sales/modules";

describe("defaultModuleMapForRole", () => {
  it("gives sales admins every module by default", () => {
    const map = defaultModuleMapForRole(true);
    for (const key of SALES_MODULE_KEYS) {
      expect(map[key]).toBe(true);
    }
  });

  it("gives employees only the curated default modules", () => {
    const map = defaultModuleMapForRole(false);
    for (const key of SALES_MODULE_KEYS) {
      expect(map[key]).toBe(DEFAULT_EMPLOYEE_MODULES.includes(key));
    }
    expect(map["reports.reports"]).toBe(false);
    expect(map["leads.management"]).toBe(true);
  });
});

describe("override precedence (mirrors getEffectiveSalesPermissions merge logic)", () => {
  function mergeOverrides(roleDefaults: Record<string, boolean>, overrides: Map<string, boolean>) {
    const effective = { ...roleDefaults };
    for (const [key, value] of overrides.entries()) effective[key] = value;
    return effective;
  }

  it("lets an explicit override turn on a module the role default has off", () => {
    const roleDefaults = defaultModuleMapForRole(false);
    expect(roleDefaults["reports.reports"]).toBe(false);
    const overrides = new Map([["reports.reports", true]]);
    const effective = mergeOverrides(roleDefaults, overrides);
    expect(effective["reports.reports"]).toBe(true);
  });

  it("lets an explicit override turn off a module the role default has on", () => {
    const roleDefaults = defaultModuleMapForRole(false);
    expect(roleDefaults["leads.management"]).toBe(true);
    const overrides = new Map([["leads.management", false]]);
    const effective = mergeOverrides(roleDefaults, overrides);
    expect(effective["leads.management"]).toBe(false);
  });

  it("leaves non-overridden modules at the role default", () => {
    const roleDefaults = defaultModuleMapForRole(false);
    const overrides = new Map([["reports.reports", true]]);
    const effective = mergeOverrides(roleDefaults, overrides);
    expect(effective["sales.forecast"]).toBe(roleDefaults["sales.forecast"]);
  });
});
