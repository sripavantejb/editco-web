export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { ProductCredential } from "@/models/os/ProductCredential";
import {
  updateProductCredential,
  archiveProductCredential,
} from "@/actions/os/credentials";
import { OsActionForm } from "@/components/os/OsActionForm";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
import { CredentialPasswordReveal } from "@/components/os/CredentialPasswordReveal";
import { AddCredentialDrawer } from "@/components/os/AddCredentialDrawer";
import {
  Field,
  OsPage,
  OsTable,
  Td,
  Th,
  osInputClass,
  osTextareaClass,
} from "@/components/os/ui";
import { hasEncryptedSecret } from "@/lib/os/vault-crypto";
import { hasPermission } from "@/lib/os/permissions";

export default async function CredentialsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const staff = await requireOsPage("vault:credentials");
  const canWrite = hasPermission(staff.permissions, "vault:credentials");
  const { q = "" } = await searchParams;
  const trimmed = q.trim();

  const query: Record<string, unknown> = { recordStatus: "active" };
  if (trimmed) {
    const re = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [
      { productName: re },
      { category: re },
      { username: re },
      { url: re },
      { notes: re },
    ];
  }

  const rows = await ProductCredential.find(query).sort({ productName: 1 }).lean();

  return (
    <OsPage
      title="Credentials"
      subtitle="Secure store for every product login — encrypted passwords, reveal on demand."
      backHref="/admin/os"
      backLabel="Back to dashboard"
      actions={canWrite ? <AddCredentialDrawer /> : undefined}
    >
      <form method="get" className="mb-4 flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={trimmed}
          placeholder="Search product, category, username…"
          className="flex h-11 min-w-[220px] flex-1 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center rounded-xl border border-[var(--dash-border)] px-4 font-archivo text-xs uppercase tracking-[0.08em]"
        >
          Search
        </button>
      </form>

      <OsTable>
        <thead>
          <tr>
            <Th>Product</Th>
            <Th>Login</Th>
            <Th>Password</Th>
            <Th>Notes</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const id = String(r._id);
            const hasPassword = hasEncryptedSecret({ cipher: r.passwordCipher });
            return (
              <tr key={id}>
                <Td>
                  <div className="font-inter font-medium">{r.productName}</div>
                  <div className="mt-0.5 text-xs text-[var(--dash-muted)]">
                    {r.category || "—"}
                    {r.url ? (
                      <>
                        {" · "}
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--dash-accent)] hover:underline"
                        >
                          Open
                        </a>
                      </>
                    ) : null}
                  </div>
                </Td>
                <Td>
                  <span className="font-mono text-sm">{r.username || "—"}</span>
                </Td>
                <Td>
                  <CredentialPasswordReveal id={id} hasPassword={hasPassword} />
                </Td>
                <Td>
                  <span className="text-sm text-[var(--dash-muted)]">
                    {r.notes || "—"}
                  </span>
                </Td>
                <Td>
                  {canWrite ? (
                    <div className="flex flex-wrap items-start gap-2">
                      <details className="rounded-lg border border-[var(--dash-border)] px-2 py-1">
                        <summary className="cursor-pointer font-inter text-xs text-[var(--dash-muted)]">
                          Edit
                        </summary>
                        <div className="mt-2 w-72">
                          <OsActionForm
                            action={updateProductCredential}
                            submitLabel="Save"
                            className="space-y-2"
                          >
                            <input type="hidden" name="id" value={id} />
                            <input
                              name="productName"
                              defaultValue={r.productName}
                              required
                              className={osInputClass()}
                            />
                            <input
                              name="category"
                              defaultValue={r.category || ""}
                              className={osInputClass()}
                            />
                            <input
                              name="url"
                              defaultValue={r.url || ""}
                              className={osInputClass()}
                            />
                            <input
                              name="username"
                              defaultValue={r.username || ""}
                              className={osInputClass()}
                            />
                            <input
                              name="password"
                              type="password"
                              placeholder="Leave blank to keep"
                              autoComplete="new-password"
                              className={osInputClass()}
                            />
                            <textarea
                              name="notes"
                              rows={2}
                              defaultValue={r.notes || ""}
                              className={osTextareaClass()}
                            />
                          </OsActionForm>
                        </div>
                      </details>
                      <RowDeleteButton
                        action={archiveProductCredential}
                        id={id}
                        confirmMessage={`Delete credentials for "${r.productName}"?`}
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--dash-muted)]">—</span>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </OsTable>

      {rows.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">
          No credentials saved yet.
        </p>
      ) : null}
    </OsPage>
  );
}
