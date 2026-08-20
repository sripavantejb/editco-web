export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { resolvePortalByUuid } from "@/lib/os/resolve-portal";
import { OsDocument } from "@/models/os/Document";
import { formatDate } from "@/lib/utils";
import { PortalCard, PortalPageHeader } from "@/components/os/portal/ui";

export default async function ClientDocumentsPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const portal = await resolvePortalByUuid(uuid);
  if (!portal) notFound();
  const docs = await OsDocument.find({
    conversionUuid: portal.conversion.conversionUuid,
    recordStatus: "active",
    visibleToClient: true,
  })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main className="px-4 py-10 sm:px-8">
      <PortalPageHeader
        title="Documents"
        subtitle="Files Editco has shared with you."
      />
      <ul className="space-y-3 font-inter text-sm">
        {docs.map((d) => (
          <li key={String(d._id)}>
            <PortalCard className="flex flex-wrap items-center justify-between gap-3">
              <span>
                {d.title} · {formatDate(d.createdAt)}
              </span>
              {d.dataBase64 ? (
                <a
                  className="text-[var(--dash-accent)]"
                  href={`data:${d.mimeType};base64,${d.dataBase64}`}
                  download={d.fileName || d.title}
                >
                  Download
                </a>
              ) : null}
            </PortalCard>
          </li>
        ))}
      </ul>
      {docs.length === 0 ? (
        <p className="font-inter text-sm text-[var(--dash-muted)]">
          No documents shared yet.
        </p>
      ) : null}
    </main>
  );
}
