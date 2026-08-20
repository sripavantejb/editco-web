import { describe, expect, it } from "vitest";
import { hasPermission, permissionsForRole, canManageUsers } from "@/lib/os/permissions";
import { canTransitionTask } from "@/lib/os/transitions";
import { detectCycleInAdjacency } from "@/lib/os/task-deps";
import {
  exceededPlanned,
  formatDurationMs,
  plannedDurationMs,
  sumSessionDurations,
} from "@/lib/os/task-timing";

describe("permissions", () => {
  it("super_admin has wildcard", () => {
    const perms = permissionsForRole("super_admin");
    expect(hasPermission(perms, "users:write")).toBe(true);
    expect(hasPermission(perms, "anything")).toBe(true);
    expect(canManageUsers("super_admin")).toBe(true);
  });

  it("admin cannot manage users", () => {
    const perms = permissionsForRole("admin");
    expect(hasPermission(perms, "*")).toBe(false);
    expect(hasPermission(perms, "projects:write")).toBe(true);
    expect(hasPermission(perms, "tasks:write")).toBe(true);
    expect(canManageUsers("admin")).toBe(false);
  });

  it("team_member has scoped task access", () => {
    const perms = permissionsForRole("team_member");
    expect(hasPermission(perms, "tasks:write")).toBe(true);
    expect(hasPermission(perms, "projects:read")).toBe(true);
    expect(hasPermission(perms, "projects:write")).toBe(false);
    expect(hasPermission(perms, "invoices:write")).toBe(false);
  });
});

describe("task transitions", () => {
  it("allows todo to in_progress", () => {
    expect(canTransitionTask("todo", "in_progress")).toBe(true);
  });

  it("allows in_progress to blocked and completed", () => {
    expect(canTransitionTask("in_progress", "blocked")).toBe(true);
    expect(canTransitionTask("in_progress", "completed")).toBe(true);
  });

  it("blocks completed to in_progress", () => {
    expect(canTransitionTask("completed", "in_progress")).toBe(false);
  });
});

describe("dependency cycles", () => {
  it("rejects self dependency", () => {
    expect(
      detectCycleInAdjacency([], { taskId: "a", dependsOnTaskId: "a" })
    ).toBe(true);
  });

  it("rejects A→B→C→A", () => {
    const edges = [
      { taskId: "b", dependsOnTaskId: "a" },
      { taskId: "c", dependsOnTaskId: "b" },
    ];
    expect(
      detectCycleInAdjacency(edges, { taskId: "a", dependsOnTaskId: "c" })
    ).toBe(true);
  });

  it("allows acyclic chain", () => {
    const edges = [{ taskId: "b", dependsOnTaskId: "a" }];
    expect(
      detectCycleInAdjacency(edges, { taskId: "c", dependsOnTaskId: "b" })
    ).toBe(false);
  });
});

describe("task timing", () => {
  it("formats durations", () => {
    expect(formatDurationMs(90 * 60000)).toBe("1h 30m");
    expect(formatDurationMs(45 * 60000)).toBe("45m");
  });

  it("detects exceeded planned", () => {
    const start = new Date("2026-01-01T10:00:00Z");
    const end = new Date("2026-01-01T12:00:00Z");
    expect(plannedDurationMs(start, end)).toBe(2 * 3600000);
    expect(exceededPlanned(3 * 3600000, start, end)).toBe(true);
    expect(exceededPlanned(1 * 3600000, start, end)).toBe(false);
  });

  it("sums work sessions including open", () => {
    const sessions = [
      {
        startedAt: new Date("2026-01-01T10:00:00Z"),
        endedAt: new Date("2026-01-01T11:00:00Z"),
        durationMs: 3600000,
      },
      {
        startedAt: new Date("2026-01-01T12:00:00Z"),
        endedAt: null,
      },
    ];
    const now = new Date("2026-01-01T12:30:00Z").getTime();
    expect(sumSessionDurations(sessions, now)).toBe(3600000 + 30 * 60000);
  });
});
