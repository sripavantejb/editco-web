export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { StaffUser } from "@/models/os/StaffUser";
import { ProjectMember } from "@/models/os/ProjectMember";
import { OsTask } from "@/models/os/Task";
import { createStaffUser, updateStaffUser } from "@/actions/os/staff";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, OsPage, osInputClass } from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";
import { STAFF_ROLES, STAFF_ROLE_LABELS } from "@/lib/os/constants";
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
          <input name="password" type="password" required className={osInputClass()} />
        </Field>
        <Field label="Role">
          <OsSelect
            name="role"
            defaultValue="team_member"
            options={STAFF_ROLES.filter((r) => r !== "super_admin").map((r) => ({ value: r, label: STAFF_ROLE_LABELS[r] }))}
          />
        </Field>
      </OsActionForm>
      <div className="space-y-6">
        {users.map((u) => {
          const id = String(u._id);
          return (
            <OsActionForm
              key={id}
              action={updateStaffUser}
              submitLabel="Save"
              className="grid max-w-xl gap-2 rounded-2xl border border-[var(--dash-border)] p-4"
            >
              <input type="hidden" name="id" value={id} />
              <p className="font-inter text-sm text-[var(--dash-muted)]">{u.email}</p>
              <p className="font-inter text-xs text-[var(--dash-muted)]">
                Projects: {projectCount.get(id) || 0} · Open tasks:{" "}
                {taskCount.get(id) || 0}
                {u.lastLoginAt
                  ? ` · Last login: ${formatDateTime(u.lastLoginAt)}`
                  : " · Never logged in"}
              </p>
              <Field label="Name">
                <input name="name" defaultValue={u.name} className={osInputClass()} />
              </Field>
              <Field label="Role">
                <OsSelect
                  name="role"
                  defaultValue={u.role}
                  options={STAFF_ROLES.map((r) => ({ value: r, label: STAFF_ROLE_LABELS[r] }))}
                />
              </Field>
              <Field label="New password (optional)">
                <input name="password" type="password" className={osInputClass()} />
              </Field>
              <Field label="Active">
                <OsSelect
                  name="isActive"
                  defaultValue={u.isActive ? "true" : "false"}
                  options={[{ value: "true", label: "Active" }, { value: "false", label: "Inactive" }]}
                />
              </Field>
            </OsActionForm>
          );
        })}
      </div>
    </OsPage>
  );
}
