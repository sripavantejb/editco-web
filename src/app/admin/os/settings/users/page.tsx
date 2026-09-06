export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { StaffUser } from "@/models/os/StaffUser";
import { ProjectMember } from "@/models/os/ProjectMember";
import { OsTask } from "@/models/os/Task";
import { createStaffUser } from "@/actions/os/staff";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, OsPage, osInputClass } from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";
import { OsPasswordInput } from "@/components/os/OsPasswordInput";
import { StaffUsersGrid, type StaffUserCard } from "@/components/os/StaffUsersGrid";
import { STAFF_ROLES, STAFF_ROLE_LABELS, type StaffRole } from "@/lib/os/constants";
import { formatDateTime } from "@/lib/utils";

export default async function UsersSettingsPage() {
  await requireOsPage("*");
  const users = await StaffUser.find({}).sort({ email: 1 }).lean();
  const userIds = users.map((u) => u._id);
  const [memberships, tasks] = await Promise.all([
    ProjectMember.find({ userId: { $in: userIds } }).lean(),
    OsTask.find({
      assignedToId: { $in: userIds },
      recordStatus: "active",
      status: { $nin: ["completed", "cancelled"] },
    })
      .select("assignedToId")
      .lean(),
  ]);

  const projectCount = new Map<string, number>();
  for (const m of memberships) {
    const id = String(m.userId);
    projectCount.set(id, (projectCount.get(id) || 0) + 1);
  }
  const taskCount = new Map<string, number>();
  for (const t of tasks) {
    if (!t.assignedToId) continue;
    const id = String(t.assignedToId);
    taskCount.set(id, (taskCount.get(id) || 0) + 1);
  }

  const cards: StaffUserCard[] = users.map((u) => {
    const id = String(u._id);
    return {
      id,
      name: u.name || "",
      email: u.email,
      role: u.role as StaffRole,
      isActive: Boolean(u.isActive),
      projectCount: projectCount.get(id) || 0,
      taskCount: taskCount.get(id) || 0,
      lastLoginLabel: u.lastLoginAt
        ? `Last login: ${formatDateTime(u.lastLoginAt)}`
        : "Never logged in",
    };
  });

  return (
    <OsPage
      title="Users & roles"
      subtitle="Internal team accounts. Soft-deactivate to preserve history."
      backHref="/admin/os"
      backLabel="Back to dashboard"
    >
      <OsActionForm
        action={createStaffUser}
        submitLabel="Add user"
        className="mb-10 grid max-w-xl gap-3"
      >
        <Field label="Name">
          <input name="name" className={osInputClass()} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" required className={osInputClass()} />
        </Field>
        <Field label="Password">
          <OsPasswordInput name="password" required />
        </Field>
        <Field label="Role">
          <OsSelect
            name="role"
            defaultValue="team_member"
            options={STAFF_ROLES.filter((r) => r !== "super_admin").map((r) => ({
              value: r,
              label: STAFF_ROLE_LABELS[r],
            }))}
          />
        </Field>
      </OsActionForm>

      <h2 className="mb-3 font-inter text-sm font-semibold text-[#111111]">Team</h2>
      <StaffUsersGrid users={cards} />
    </OsPage>
  );
}
