export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { StaffUser } from "@/models/os/StaffUser";
import { ProjectMember } from "@/models/os/ProjectMember";
import { OsTask } from "@/models/os/Task";
import { createStaffUser, updateStaffUser } from "@/actions/os/staff";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, OsPage, osInputClass, osSelectClass } from "@/components/os/ui";
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
          <select name="role" defaultValue="team_member" className={osSelectClass()}>
            {STAFF_ROLES.filter((r) => r !== "super_admin").map((r) => (
              <option key={r} value={r}>
                {STAFF_ROLE_LABELS[r]}
              </option>
            ))}
          </select>
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
                <select name="role" defaultValue={u.role} className={osSelectClass()}>
                  {STAFF_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {STAFF_ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="New password (optional)">
                <input name="password" type="password" className={osInputClass()} />
              </Field>
              <Field label="Active">
                <select
                  name="isActive"
                  defaultValue={u.isActive ? "true" : "false"}
                  className={osSelectClass()}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </Field>
            </OsActionForm>
          );
        })}
      </div>
    </OsPage>
  );
}
