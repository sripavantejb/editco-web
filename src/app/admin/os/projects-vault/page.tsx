export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { VaultProject } from "@/models/os/VaultProject";
import { hasEncryptedSecret } from "@/lib/os/vault-crypto";
import { getVaultProjectsComparison } from "@/lib/os/services/vault-analytics";
import {
  VAULT_PROJECT_STATUS_LABELS,
  type VaultProjectStatus,
} from "@/lib/os/constants";
import {
  OsBadge,
  OsPage,
  OsTable,
  Td,
  Th,
} from "@/components/os/ui";
import { VaultPasswordReveal } from "@/components/os/VaultPasswordReveal";
import { hasPermission } from "@/lib/os/permissions";
import type { StaffContext } from "@/lib/os/staff";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
import { archiveVaultProject } from "@/actions/os/vault-projects";

function vaultTone(
  status: string
): "neutral" | "ok" | "warn" | "bad" | "accent" {
  if (status === "active") return "ok";
  if (status === "archived") return "bad";
  if (status === "inactive") return "warn";
  return "neutral";
}

export default async function ProjectsVaultPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const staff = (await requireOsPage("vault:read")) as StaffContext;
  const canWrite = hasPermission(staff.permissions, "vault:write");
  const canCreds = hasPermission(staff.permissions, "vault:credentials");
  const { q = "", sort = "name" } = await searchParams;
  const trimmedQ = q.trim();

  const query: Record<string, unknown> = { recordStatus: "active" };
  if (trimmedQ) {
    const re = new RegExp(trimmedQ.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [
      { name: re },
      { category: re },
      { loginEmail: re },
      { localUrl: re },
      { productionUrl: re },
    ];
  }

  const projects = await VaultProject.find(query)
    .sort({ name: 1 })
    .lean();

  const comparison = await getVaultProjectsComparison(
    projects.map((p) => String(p._id))
  );

  type Row = {
    id: string;
    name: string;
    peoplePitched: number;
    interested: number;
    currentlyWorking: number;
    sold: number;
    conversionRate: number;
  };

  const rows: Row[] = projects.map((p) => {
    const id = String(p._id);
    const c = comparison.get(id);
    return {
      id,
      name: p.name,
      peoplePitched: c?.peoplePitched ?? 0,
      interested: c?.interested ?? 0,
      currentlyWorking: c?.currentlyWorking ?? 0,
      sold: c?.sold ?? 0,
      conversionRate: c?.conversionRate ?? 0,
    };
  });

  const sortKey = sort || "name";
  rows.sort((a, b) => {
    if (sortKey === "pitched") return b.peoplePitched - a.peoplePitched;
    if (sortKey === "interested") return b.interested - a.interested;
    if (sortKey === "working") return b.currentlyWorking - a.currentlyWorking;
    if (sortKey === "sold") return b.sold - a.sold;
    if (sortKey === "conversion") return b.conversionRate - a.conversionRate;
    if (sortKey === "conversion_asc")
      return a.conversionRate - b.conversionRate;
    return a.name.localeCompare(b.name);
  });

  const sortHref = (key: string) => {
    const params = new URLSearchParams();
    if (trimmedQ) params.set("q", trimmedQ);
    params.set("sort", key);
    return `/admin/os/projects-vault?${params.toString()}`;
  };

  return (
    <OsPage
      title="Projects Vault"
      subtitle="Internal product catalog for pitching Editco projects — credentials, messages, and intelligence."
      backHref="/admin/os"
      backLabel="Back to dashboard"
      actions={
        canWrite ? (
          <Link
            href="/admin/os/projects-vault/new"
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--dash-accent)] px-5 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-on-accent)]"
          >
            + Add project
          </Link>
        ) : null
      }
    >
      <form className="mb-6 flex flex-wrap gap-2" method="get">
        <input
          name="q"
          defaultValue={trimmedQ}
          placeholder="Search name, URL, email, category…"
          className="flex h-11 min-w-[220px] flex-1 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)]"
        />
        <input type="hidden" name="sort" value={sortKey} />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-xl border border-[var(--dash-border)] px-4 font-archivo text-xs uppercase tracking-[0.08em]"
        >
          Search
        </button>
      </form>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <p className="font-inter text-sm text-[var(--dash-muted)]">
            No vault projects yet.
            {canWrite ? " Add your first product to pitch." : null}
          </p>
        ) : null}
        {projects.map((p) => {
          const id = String(p._id);
          const hasPassword = hasEncryptedSecret(p);
          return (
            <div
              key={id}
              className="rounded-xl border border-[var(--dash-border)] p-5"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link
                    href={`/admin/os/projects-vault/${id}`}
                    className="font-archivo text-lg uppercase tracking-wide text-[var(--dash-accent)] hover:underline"
                  >
                    {p.name}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <OsBadge tone={vaultTone(p.status)}>
                      {
                        VAULT_PROJECT_STATUS_LABELS[
                          p.status as VaultProjectStatus
                        ]
                      }
                    </OsBadge>
                    {p.category ? (
                      <OsBadge tone="neutral">{p.category}</OsBadge>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.productionUrl ? (
                    <a
                      href={p.productionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-9 items-center rounded-full bg-[var(--dash-accent)] px-3 font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-on-accent)]"
                    >
                      Open production
                    </a>
                  ) : (
                    <span className="inline-flex min-h-9 items-center rounded-full border border-[var(--dash-border)] px-3 font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-muted)] opacity-50">
                      Open production
                    </span>
                  )}
                  {canWrite ? (
                    <Link
                      href={`/admin/os/projects-vault/${id}/edit`}
                      className="inline-flex min-h-9 items-center rounded-full border border-[var(--dash-border)] px-3 font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-text)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
                    >
                      Edit
                    </Link>
                  ) : null}
                  {canWrite ? (
                    <RowDeleteButton
                      action={archiveVaultProject}
                      id={id}
                      confirmMessage={`Delete vault project "${p.name}"?`}
                    />
                  ) : null}
                </div>
              </div>
              <dl className="grid gap-2 font-inter text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[var(--dash-muted)]">Local</dt>
                  <dd className="break-all text-[var(--dash-text)]">
                    {p.localUrl || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--dash-muted)]">Production</dt>
                  <dd className="break-all text-[var(--dash-text)]">
                    {p.productionUrl || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--dash-muted)]">Email</dt>
                  <dd>{p.loginEmail || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[var(--dash-muted)]">Password</dt>
                  <dd>
                    <VaultPasswordReveal
                      projectId={id}
                      hasPassword={hasPassword}
                      canReveal={canCreds}
                    />
                  </dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>

      {rows.length > 0 ? (
        <div className="mt-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
              Comparison
            </h2>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["name", "Name"],
                  ["pitched", "Most pitched"],
                  ["interested", "Most interested"],
                  ["working", "Most working"],
                  ["sold", "Most sold"],
                  ["conversion", "Highest conversion"],
                  ["conversion_asc", "Lowest conversion"],
                ] as const
              ).map(([key, label]) => (
                <Link
                  key={key}
                  href={sortHref(key)}
                  className={`inline-flex min-h-8 items-center rounded-full border px-3 font-archivo text-[10px] uppercase tracking-[0.08em] ${
                    sortKey === key
                      ? "border-[var(--dash-accent)] text-[var(--dash-accent)]"
                      : "border-[var(--dash-border)] text-[var(--dash-muted)]"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <OsTable>
            <thead>
              <tr>
                <Th>Project</Th>
                <Th>Pitched</Th>
                <Th>Interested</Th>
                <Th>Working</Th>
                <Th>Sold</Th>
                <Th>Conversion</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <Td>
                    <Link
                      href={`/admin/os/projects-vault/${r.id}`}
                      className="text-[var(--dash-accent)] hover:underline"
                    >
                      {r.name}
                    </Link>
                  </Td>
                  <Td>{r.peoplePitched}</Td>
                  <Td>{r.interested}</Td>
                  <Td>{r.currentlyWorking}</Td>
                  <Td>{r.sold}</Td>
                  <Td>{r.conversionRate}%</Td>
                </tr>
              ))}
            </tbody>
          </OsTable>
        </div>
      ) : null}
    </OsPage>
  );
}
