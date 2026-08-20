export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOsPage } from "@/lib/os/page";
import { VaultProject } from "@/models/os/VaultProject";
import { VaultProjectMessage } from "@/models/os/VaultProjectMessage";
import { ActivityEvent } from "@/models/os/ActivityEvent";
import { hasEncryptedSecret } from "@/lib/os/vault-crypto";
import { getVaultProjectAnalytics } from "@/lib/os/services/vault-analytics";
import {
  PITCH_STATUS_LABELS,
  VAULT_PROJECT_STATUS_LABELS,
  type PitchStatus,
  type VaultMessageType,
  type VaultProjectStatus,
} from "@/lib/os/constants";
import { OsBadge, OsPage } from "@/components/os/ui";
import { VaultPasswordReveal } from "@/components/os/VaultPasswordReveal";
import { VaultMessagesForm } from "@/components/os/VaultMessagesForm";
import { hasPermission } from "@/lib/os/permissions";
import { formatDate } from "@/lib/utils";
import type { StaffContext } from "@/lib/os/staff";

function vaultTone(
  status: string
): "neutral" | "ok" | "warn" | "bad" | "accent" {
  if (status === "active") return "ok";
  if (status === "archived") return "bad";
  if (status === "inactive") return "warn";
  return "neutral";
}

export default async function VaultProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const staff = (await requireOsPage("vault:read")) as StaffContext;
  const canWrite = hasPermission(staff.permissions, "vault:write");
  const canCreds = hasPermission(staff.permissions, "vault:credentials");
  const { id } = await params;
  const { tab = "access" } = await searchParams;

  const project = await VaultProject.findById(id).lean();
  if (!project || project.recordStatus !== "active") notFound();

  const [messages, analytics, activity] = await Promise.all([
    VaultProjectMessage.find({ projectId: id }).lean(),
    getVaultProjectAnalytics(id),
    ActivityEvent.find({
      entityType: "vault_project",
      entityId: id,
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean(),
  ]);

  const msgMap: Partial<
    Record<VaultMessageType, { subject?: string; body?: string }>
  > = {};
  for (const m of messages) {
    msgMap[m.type as VaultMessageType] = {
      subject: m.subject || "",
      body: m.body || "",
    };
  }

  const tabs = [
    { id: "access", label: "Access" },
    { id: "intelligence", label: "Sales intelligence" },
    { id: "analytics", label: "Analytics" },
    { id: "messages", label: "Messages" },
    { id: "notes", label: "Notes" },
    { id: "activity", label: "Activity" },
  ] as const;

  const activeTab = tabs.some((t) => t.id === tab) ? tab : "access";
  const hasPassword = hasEncryptedSecret(project);

  const openBtn = (href: string | undefined | null, label: string) =>
    href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-10 items-center rounded-full bg-[var(--dash-accent)] px-4 font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-on-accent)]"
      >
        {label}
      </a>
    ) : (
      <span className="inline-flex min-h-10 cursor-not-allowed items-center rounded-full border border-[var(--dash-border)] px-4 font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-muted)] opacity-50">
        {label}
      </span>
    );

  return (
    <OsPage
      title={project.name}
      subtitle={
        project.description ||
        project.category ||
        "Project intelligence and access"
      }
      backHref="/admin/os/projects-vault"
      backLabel="Back to vault"
      actions={
        <div className="flex flex-wrap gap-2">
          <OsBadge tone={vaultTone(project.status)}>
            {
              VAULT_PROJECT_STATUS_LABELS[
                project.status as VaultProjectStatus
              ]
            }
          </OsBadge>
          {openBtn(project.localUrl, "Open local")}
          {openBtn(project.productionUrl, "Open production")}
          {canWrite ? (
            <Link
              href={`/admin/os/projects-vault/${id}/edit`}
              className="inline-flex min-h-10 items-center rounded-full border border-[var(--dash-border)] px-4 font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-text)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
            >
              Edit project
            </Link>
          ) : null}
        </div>
      }
    >
      <div className="mb-6 flex flex-wrap gap-2 border-b border-[var(--dash-border)] pb-3">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/admin/os/projects-vault/${id}?tab=${t.id}`}
            className={`inline-flex min-h-9 items-center rounded-full px-4 font-archivo text-[10px] uppercase tracking-[0.08em] ${
              activeTab === t.id
                ? "bg-[var(--dash-accent)] text-[var(--dash-on-accent)]"
                : "border border-[var(--dash-border)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {activeTab === "access" ? (
        <dl className="grid max-w-2xl gap-4 font-inter text-sm sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-[var(--dash-muted)]">Local URL</dt>
            <dd className="break-all">{project.localUrl || "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[var(--dash-muted)]">Production URL</dt>
            <dd className="break-all">{project.productionUrl || "—"}</dd>
          </div>
          <div>
            <dt className="text-[var(--dash-muted)]">Login email</dt>
            <dd>{project.loginEmail || "—"}</dd>
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
      ) : null}

      {activeTab === "intelligence" ? (
        <dl className="grid max-w-3xl gap-4 font-inter text-sm">
          {(
            [
              ["Target industry", project.targetIndustry],
              ["Ideal customer", project.idealCustomer],
              ["Key selling points", project.sellingPoints],
              ["Common objections", project.commonObjections],
              ["Best pitch angle", project.bestPitchAngle],
              ["Pricing notes", project.pricingNotes],
              ["Competitors", project.competitors],
              ["Demo notes", project.demoNotes],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <dt className="font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)]">
                {label}
              </dt>
              <dd className="mt-1 whitespace-pre-wrap text-[var(--dash-text)]">
                {value || "—"}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {activeTab === "analytics" ? (
        <div className="space-y-8">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["People pitched", analytics.peoplePitched],
                ["Pitch attempts", analytics.pitchAttempts],
                ["Interested", analytics.interested],
                ["Currently working", analytics.currentlyWorking],
                ["Won (unique)", analytics.uniqueClientsWon],
                ["Deals won", analytics.dealsWon],
                ["Lost", analytics.lost],
                ["Conversion rate", `${analytics.conversionRate}%`],
                ["Interest rate", `${analytics.interestRate}%`],
                ["Win rate", `${analytics.winRate}%`],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-[var(--dash-border)] p-4"
              >
                <p className="font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-muted)]">
                  {label}
                </p>
                <p className="mt-2 font-archivo text-2xl text-[var(--dash-text)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <div>
            <h3 className="mb-3 font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
              Funnel
            </h3>
            <ul className="max-w-md space-y-2 font-inter text-sm">
              {analytics.funnel.map((step, i) => (
                <li key={`${step.status}-${i}`} className="flex items-center gap-3">
                  <span className="w-28 text-[var(--dash-muted)]">
                    {PITCH_STATUS_LABELS[step.status as PitchStatus] ||
                      step.status}
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-[var(--dash-border)]">
                    <div
                      className="h-2 rounded-full bg-[var(--dash-accent)]"
                      style={{
                        width: `${
                          analytics.peoplePitched
                            ? Math.min(
                                100,
                                (step.count / analytics.peoplePitched) * 100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right">{step.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {activeTab === "messages" ? (
        canWrite ? (
          <VaultMessagesForm projectId={id} messages={msgMap} />
        ) : (
          <dl className="max-w-3xl space-y-4 font-inter text-sm">
            {Object.entries(msgMap).map(([type, m]) => (
              <div key={type}>
                <dt className="font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)]">
                  {type}
                </dt>
                {m?.subject ? (
                  <dd className="mt-1 text-[var(--dash-muted)]">
                    Subject: {m.subject}
                  </dd>
                ) : null}
                <dd className="mt-1 whitespace-pre-wrap">{m?.body || "—"}</dd>
              </div>
            ))}
            {Object.keys(msgMap).length === 0 ? (
              <p className="text-[var(--dash-muted)]">No messages yet.</p>
            ) : null}
          </dl>
        )
      ) : null}

      {activeTab === "notes" ? (
        <div className="max-w-3xl whitespace-pre-wrap font-inter text-sm text-[var(--dash-text)]">
          {project.internalNotes || "No internal notes."}
        </div>
      ) : null}

      {activeTab === "activity" ? (
        <ul className="max-w-2xl space-y-3">
          {activity.map((a) => (
            <li
              key={String(a._id)}
              className="border-b border-[var(--dash-border)] pb-3 font-inter text-sm"
            >
              <p className="text-[var(--dash-text)]">{a.title}</p>
              {a.detail ? (
                <p className="text-[var(--dash-muted)]">{a.detail}</p>
              ) : null}
              <p className="mt-1 text-xs text-[var(--dash-faint)]">
                {a.createdBy} · {formatDate(a.createdAt)}
              </p>
            </li>
          ))}
          {activity.length === 0 ? (
            <p className="font-inter text-sm text-[var(--dash-muted)]">
              No activity yet.
            </p>
          ) : null}
        </ul>
      ) : null}
    </OsPage>
  );
}
