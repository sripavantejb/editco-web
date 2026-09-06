export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { OsDocument } from "@/models/os/Document";
import { Conversion } from "@/models/os/Conversion";
import { Project } from "@/models/os/Project";
import { uploadDocument, archiveDocument } from "@/actions/os/documents";
import { OsActionForm } from "@/components/os/OsActionForm";
import { OsPage, osInputClass } from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";
import { formatDate } from "@/lib/utils";
import { hasPermission } from "@/lib/os/permissions";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";

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
      <OsSelect
        name="conversionUuid"
        required
        defaultValue=""
        placeholder="Conversion"
        options={conversions.map((c) => ({ value: c.conversionUuid, label: c.publicCode }))}
      />
      <OsSelect
        name="projectId"
        defaultValue=""
        placeholder="Project (optional)"
        options={projects.map((p) => ({ value: String(p._id), label: p.name }))}
      />
      <input name="title" required placeholder="Title" className={osInputClass()} />
      <input type="file" name="file" />
      <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name="visibleToClient" /> Visible to client
        </label>
      </OsActionForm>
      ) : null}
      <ul className="space-y-2 font-inter text-sm">
        {docs.map((d) => (
          <li
            key={String(d._id)}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--dash-border)] px-4 py-3"
          >
            <span>
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
            </span>
            {hasPermission(staff.permissions, "documents:write") ? (
              <RowDeleteButton
                action={archiveDocument}
                id={String(d._id)}
                confirmMessage={`Delete document "${d.title}"?`}
              />
            ) : null}
          </li>
        ))}
      </ul>
      </OsPage>
  );
}
