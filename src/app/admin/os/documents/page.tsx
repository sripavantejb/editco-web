export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { OsDocument } from "@/models/os/Document";
import { Conversion } from "@/models/os/Conversion";
import { Project } from "@/models/os/Project";
import { uploadDocument } from "@/actions/os/documents";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsPage, osInputClass, osSelectClass } from "@/components/os/ui";
import { formatDate } from "@/lib/utils";
import { hasPermission } from "@/lib/os/permissions";

export default async function DocumentsPage() {
  const staff = await requireOsPage("documents:read");
  const docs = await OsDocument.find({ recordStatus: "active" }).sort({ createdAt: -1 }).lean();
  const conversions = await Conversion.find({ recordStatus: "active" }).lean();
  const projects = await Project.find({ recordStatus: "active" }).lean();

  return (
    <OsPage title="Documents"
      backHref="/admin/os"
      backLabel="Back to dashboard">
      {hasPermission(staff.permissions, "documents:write") ? (
      <OsActionForm action={uploadDocument} submitLabel="Upload" className="mb-8 max-w-xl space-y-2">
      <select name="conversionUuid" required className={osSelectClass()}>
      <option value="">Conversion</option>
          {conversions.map((c) => (
            <option key={c.conversionUuid} value={c.conversionUuid}>{c.publicCode}</option>
          ))}
        </select>
      <select name="projectId" className={osSelectClass()}>
      <option value="">Project (optional)</option>
          {projects.map((p) => (
            <option key={String(p._id)} value={String(p._id)}>{p.name}</option>
          ))}
        </select>
      <input name="title" required placeholder="Title" className={osInputClass()} />
      <input type="file" name="file" />
      <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name="visibleToClient" /> Visible to client
        </label>
      </OsActionForm>
      ) : null}
      <ul className="space-y-2 font-inter text-sm">
        {docs.map((d) => (
          <li key={String(d._id)} className="rounded-xl border border-[var(--dash-border)] px-4 py-3">
            {d.title} {d.fileName ? `· ${d.fileName}` : ""} · {formatDate(d.createdAt)}
            {d.visibleToClient ? " · client" : " · internal"}
            {d.dataBase64 ? (
              <a
                className="ml-2 text-[var(--dash-accent)]"
                href={`data:${d.mimeType};base64,${d.dataBase64}`}
                download={d.fileName || d.title}
              >
                Download
              </a>
            ) : null}
          </li>
        ))}
      </ul>
      </OsPage>
  );
}
