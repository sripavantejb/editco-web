"use client";

import { useMemo, useState } from "react";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, osInputClass, osTextareaClass } from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";
import { createLead } from "@/actions/os/leads";
import { createIndustry, createServiceQuick } from "@/actions/os/catalog";
import {
  INDUSTRY_SECTORS,
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
} from "@/lib/os/constants";
import {
  VaultProjectMultiSelect,
  type VaultProjectOption,
} from "@/components/os/VaultProjectMultiSelect";

type IndustryOption = { slug: string; name: string; sector: string };
type ServiceOption = { slug: string; name: string };

export function NewLeadForm({
  industries: initialIndustries,
  services: initialServices,
  vaultProjects = [],
  defaultOwner = "",
}: {
  industries: IndustryOption[];
  services: ServiceOption[];
  vaultProjects?: VaultProjectOption[];
  defaultOwner?: string;
}) {
  const [industries, setIndustries] = useState(initialIndustries);
  const [services, setServices] = useState(initialServices);
  const [industrySlug, setIndustrySlug] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showAddIndustry, setShowAddIndustry] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [newIndustryName, setNewIndustryName] = useState("");
  const [newIndustrySector, setNewIndustrySector] = useState<string>("Other");
  const [newServiceName, setNewServiceName] = useState("");
  const [catalogMsg, setCatalogMsg] = useState<string | null>(null);

  const selectedIndustry = useMemo(
    () => industries.find((i) => i.slug === industrySlug) || null,
    [industries, industrySlug]
  );

  async function addIndustry() {
    setCatalogMsg(null);
    const fd = new FormData();
    fd.set("name", newIndustryName);
    fd.set("sector", newIndustrySector);
    const result = await createIndustry({}, fd);
    if (result.error) {
      setCatalogMsg(result.error);
      return;
    }
    if (result.industry) {
      setIndustries((prev) => {
        if (prev.some((p) => p.slug === result.industry!.slug)) return prev;
        return [...prev, result.industry!].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      });
      setIndustrySlug(result.industry.slug);
      setNewIndustryName("");
      setShowAddIndustry(false);
      setCatalogMsg(`Added industry: ${result.industry.name}`);
    }
  }

  async function addService() {
    setCatalogMsg(null);
    const fd = new FormData();
    fd.set("name", newServiceName);
    const result = await createServiceQuick({}, fd);
    if (result.error) {
      setCatalogMsg(result.error);
      return;
    }
    if (result.service) {
      setServices((prev) => {
        if (prev.some((p) => p.slug === result.service!.slug)) return prev;
        return [...prev, result.service!].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      });
      setSelectedServices((prev) =>
        prev.includes(result.service!.slug)
          ? prev
          : [...prev, result.service!.slug]
      );
      setNewServiceName("");
      setShowAddService(false);
      setCatalogMsg(`Added service: ${result.service.name}`);
    }
  }

  return (
    <OsActionForm
      action={createLead}
      submitLabel="Create lead"
      className="grid max-w-3xl gap-4 sm:grid-cols-2"
    >
      <Field label="Lead name">
        <input name="name" required className={osInputClass()} />
      </Field>
      <Field label="Company">
        <input name="company" className={osInputClass()} />
      </Field>
      <Field label="Phone">
        <input name="phone" className={osInputClass()} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" className={osInputClass()} />
      </Field>

      <Field label="Source">
        <OsSelect
          name="source"
          defaultValue="inbound"
          options={LEAD_SOURCES.map((s) => ({ value: s, label: s }))}
        />
      </Field>

      <div className="space-y-2">
        <Field label="Industry">
          <OsSelect
            name="industrySlug"
            value={industrySlug}
            onChange={setIndustrySlug}
            placeholder="Select industry"
            options={[
              { value: "", label: "Select industry" },
              ...industries.map((i) => ({ value: i.slug, label: i.name })),
            ]}
          />
        </Field>
        <input type="hidden" name="industry" value={selectedIndustry?.name || ""} />
        <input type="hidden" name="sector" value={selectedIndustry?.sector || ""} />
        {selectedIndustry ? (
          <p className="font-inter text-xs text-[var(--dash-accent)]">
            Sector focus: {selectedIndustry.sector}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setShowAddIndustry((v) => !v)}
          className="font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-muted)] hover:text-[var(--dash-accent)]"
        >
          {showAddIndustry ? "Cancel" : "+ Add industry"}
        </button>
        {showAddIndustry ? (
          <div className="space-y-2 rounded-xl border border-[var(--dash-border)] p-3">
            <input
              value={newIndustryName}
              onChange={(e) => setNewIndustryName(e.target.value)}
              placeholder="New industry name"
              className={osInputClass()}
            />
            <OsSelect
              value={newIndustrySector}
              onChange={setNewIndustrySector}
              options={INDUSTRY_SECTORS.map((s) => ({ value: s, label: s }))}
            />
            <button
              type="button"
              onClick={addIndustry}
              className="inline-flex min-h-10 items-center rounded-full border border-[var(--dash-border)] px-4 font-archivo text-[10px] uppercase tracking-[0.08em]"
            >
              Save industry
            </button>
          </div>
        ) : null}
      </div>

      <Field label="Estimated value (₹)">
        <input name="estimatedValue" type="number" className={osInputClass()} />
      </Field>
      <Field label="Assigned owner">
        <input
          name="assignedOwner"
          defaultValue={defaultOwner}
          className={osInputClass()}
        />
      </Field>
      <Field label="Status">
        <OsSelect
          name="status"
          defaultValue="new"
          options={LEAD_STATUSES.filter((s) => s !== "converted").map((s) => ({
            value: s,
            label: LEAD_STATUS_LABELS[s],
          }))}
        />
      </Field>
      <Field label="Priority">
        <OsSelect
          name="priority"
          defaultValue="medium"
          options={LEAD_PRIORITIES.map((s) => ({ value: s, label: s }))}
        />
      </Field>

      <div className="sm:col-span-2 space-y-3">
        <p className="font-inter text-xs text-[var(--dash-muted)]">
          Interested services
        </p>
        <div className="flex flex-wrap gap-3">
          {services.map((s) => {
            const checked = selectedServices.includes(s.slug);
            return (
              <label
                key={s.slug}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 font-inter text-sm transition ${
                  checked
                    ? "border-[var(--dash-accent)] bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]"
                    : "border-[var(--dash-border)] text-[var(--dash-text)]"
                }`}
              >
                <input
                  type="checkbox"
                  name="interestedServices"
                  value={s.slug}
                  checked={checked}
                  onChange={(e) => {
                    setSelectedServices((prev) =>
                      e.target.checked
                        ? [...prev, s.slug]
                        : prev.filter((x) => x !== s.slug)
                    );
                  }}
                  className="accent-[var(--dash-accent)]"
                />
                {s.name}
              </label>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setShowAddService((v) => !v)}
          className="font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-muted)] hover:text-[var(--dash-accent)]"
        >
          {showAddService ? "Cancel" : "+ Add custom service"}
        </button>
        {showAddService ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              placeholder="e.g. WhatsApp automation"
              className={`${osInputClass()} max-w-sm`}
            />
            <button
              type="button"
              onClick={addService}
              className="inline-flex min-h-10 items-center rounded-full border border-[var(--dash-border)] px-4 font-archivo text-[10px] uppercase tracking-[0.08em]"
            >
              Save service
            </button>
          </div>
        ) : null}
      </div>

      {vaultProjects.length > 0 ? (
        <div className="sm:col-span-2">
          <VaultProjectMultiSelect projects={vaultProjects} />
        </div>
      ) : null}

      {catalogMsg ? (
        <p className="sm:col-span-2 font-inter text-xs text-[var(--dash-accent)]">
          {catalogMsg}
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <Field label="Requirement">
          <textarea name="requirement" className={osTextareaClass()} />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="Notes">
          <textarea name="notes" className={osTextareaClass()} />
        </Field>
      </div>
    </OsActionForm>
  );
}
