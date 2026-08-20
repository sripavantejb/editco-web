"use client";

import { useEffect, useState } from "react";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, osInputClass, osTextareaClass } from "@/components/os/ui";
import { OsDateInput } from "@/components/os/OsDateInput";
import { convertLead } from "@/actions/os/conversions";
import { generateClientPortal } from "@/actions/os/portal";
import { createServiceQuick } from "@/actions/os/catalog";
import {
  previewLeadConversionDuplicates,
  type LeadConversionDuplicatePreview,
} from "@/actions/os/conversions";
import type { ActionState } from "@/actions/auth";

export function GeneratePortalForm({ conversionUuid }: { conversionUuid: string }) {
  const [url, setUrl] = useState<string | null>(null);

  async function action(prev: ActionState, formData: FormData) {
    const result = await generateClientPortal(prev, formData);
    if (result.url) {
      const origin = window.location.origin;
      setUrl(`${origin}${result.url}`);
    }
    return result;
  }

  return (
    <div className="space-y-3">
      <OsActionForm action={action} submitLabel="Generate client portal">
        <input type="hidden" name="conversionUuid" value={conversionUuid} />
        <p className="font-inter text-sm text-[var(--dash-muted)]">
          Creates a stable portal URL using this client&apos;s conversion UUID.
          Generating again keeps the same link.
        </p>
      </OsActionForm>
      {url ? (
        <p className="break-all rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] p-3 font-inter text-xs text-[var(--dash-text)]">
          {url}
        </p>
      ) : null}
    </div>
  );
}

const STEPS = [
  "1. Client",
  "2. Deal & project",
  "3. Optional details",
  "4. Convert",
] as const;

export function ConvertWizard({
  lead,
  services: initialServices,
}: {
  lead: {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    industry: string;
    estimatedValue: number;
    requirement: string;
    interestedServices?: string[];
  };
  services: { slug: string; name: string }[];
}) {
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState(lead.company || lead.name);
  const [contactPerson, setContactPerson] = useState(lead.name);
  const [email, setEmail] = useState(lead.email);
  const [phone, setPhone] = useState(lead.phone);
  const [industry, setIndustry] = useState(lead.industry || "");
  const [services, setServices] = useState(initialServices);
  const [selectedServices, setSelectedServices] = useState<string[]>(
    lead.interestedServices || []
  );
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [serviceMsg, setServiceMsg] = useState<string | null>(null);

  const [dupPreview, setDupPreview] =
    useState<LeadConversionDuplicatePreview | null>(null);
  const [dupLoading, setDupLoading] = useState(false);
  const [dupModeInitialized, setDupModeInitialized] = useState(false);

  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [forceNew, setForceNew] = useState(false);

  async function addService() {
    setServiceMsg(null);
    const fd = new FormData();
    fd.set("name", newServiceName);
    const result = await createServiceQuick({}, fd);
    if (result.error) {
      setServiceMsg(result.error);
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
      setServiceMsg(`Added service: ${result.service.name}`);
    }
  }

  useEffect(() => {
    if (step !== 4) return;

    let cancelled = false;
    setDupLoading(true);
    setDupPreview(null);
    setDupModeInitialized(false);

    Promise.resolve(
      previewLeadConversionDuplicates({
        companyName,
        email,
        phone,
      })
    )
      .then((res: any) => {
        if (cancelled) return;
        if (res?.error) {
          setDupPreview(null);
          return;
        }
        setDupPreview(res as LeadConversionDuplicatePreview);
      })
      .finally(() => {
        if (cancelled) return;
        setDupLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [step, companyName, email, phone]);

  useEffect(() => {
    if (!dupPreview) return;
    if (dupModeInitialized) return;

    setForceNew(dupPreview.suggestedMode === "create_new");
    setSelectedVendorId(dupPreview.vendors[0]?.vendorId ?? null);
    setDupModeInitialized(true);
  }, [dupPreview, dupModeInitialized]);

  return (
    <OsActionForm
      action={convertLead}
      submitLabel="Convert to client"
      showSubmit={step === 4}
    >
      <input type="hidden" name="leadId" value={lead.id} />
      <input
        type="hidden"
        name="selectedVendorId"
        value={selectedVendorId ?? ""}
      />

      <p className="mb-4 font-inter text-sm text-[var(--dash-muted)]">
        Only <span className="text-[var(--dash-text)]">company name</span> is
        required. Timeline, project, GST, website, and address can be filled
        later or left blank.
      </p>

      <div className="mb-6 flex flex-wrap gap-3 font-inter text-xs text-[var(--dash-muted)]">
        {STEPS.map((label, idx) => {
          const target = idx + 1;
          return (
            <button
              key={target}
              type="button"
              onClick={() => setStep(target)}
              className={
                step === target
                  ? "text-[var(--dash-accent)]"
                  : "hover:text-[var(--dash-text)]"
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Step 1 — Client */}
      <div className={step === 1 ? "grid gap-4 sm:grid-cols-2" : "hidden"}>
        <Field label="Company (required)">
          <input
            name="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={osInputClass()}
            required
          />
        </Field>
        <Field label="Contact person">
          <input
            name="contactPerson"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            className={osInputClass()}
          />
        </Field>
        <Field label="Email">
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={osInputClass()}
          />
        </Field>
        <Field label="Phone">
          <input
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={osInputClass()}
          />
        </Field>
        <Field label="Industry">
          <input
            name="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className={osInputClass()}
          />
        </Field>
        <div className="sm:col-span-2">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--dash-border)] px-5 font-archivo text-xs uppercase tracking-[0.08em]"
          >
            Continue
          </button>
        </div>
      </div>

      {/* Step 2 — Deal & project */}
      <div className={step === 2 ? "grid gap-4 sm:grid-cols-2" : "hidden"}>
        <Field label="Deal value (₹)">
          <input
            name="conversionValue"
            type="number"
            defaultValue={lead.estimatedValue}
            className={osInputClass()}
          />
        </Field>
        <Field label="Expected project start">
          <OsDateInput name="expectedStart" />
        </Field>
        <Field label="Account owner">
          <input
            name="owner"
            className={osInputClass()}
            placeholder="Account owner"
          />
        </Field>
        <Field label="First project name">
          <input
            name="projectName"
            defaultValue={lead.requirement || lead.company || "New project"}
            className={osInputClass()}
          />
        </Field>
        <label className="flex items-center gap-2 font-inter text-sm sm:col-span-2">
          <input type="checkbox" name="createProject" defaultChecked />
          Create first project now
        </label>

        <div className="sm:col-span-2 space-y-3">
          <p className="font-inter text-xs text-[var(--dash-muted)]">
            Services (optional)
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
                    name="services"
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
          {serviceMsg ? (
            <p className="font-inter text-xs text-[var(--dash-accent)]">
              {serviceMsg}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button
            type="button"
            onClick={() => setStep(3)}
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--dash-border)] px-5 font-archivo text-xs uppercase tracking-[0.08em]"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={() => setStep(4)}
            className="inline-flex min-h-11 items-center rounded-full px-5 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)] hover:text-[var(--dash-accent)]"
          >
            Skip optional → Convert
          </button>
        </div>
      </div>

      {/* Step 3 — Optional */}
      <div className={step === 3 ? "grid gap-4 sm:grid-cols-2" : "hidden"}>
        <p className="sm:col-span-2 font-inter text-sm text-[var(--dash-muted)]">
          All optional — skip if you don’t have GST / website / address yet.
        </p>
        <Field label="GST / tax (optional)">
          <input name="gstNumber" className={osInputClass()} />
        </Field>
        <Field label="Website (optional)">
          <input name="website" className={osInputClass()} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Address (optional)">
            <textarea
              name="address"
              placeholder="Address"
              className={osTextareaClass()}
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button
            type="button"
            onClick={() => setStep(4)}
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--dash-border)] px-5 font-archivo text-xs uppercase tracking-[0.08em]"
          >
            Continue to convert
          </button>
          <button
            type="button"
            onClick={() => setStep(4)}
            className="inline-flex min-h-11 items-center rounded-full px-5 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)] hover:text-[var(--dash-accent)]"
          >
            Skip
          </button>
        </div>
      </div>

      {/* Step 4 — Duplicates + convert */}
      <div className={step === 4 ? "space-y-4" : "hidden"}>
        <p className="font-inter text-sm text-[var(--dash-muted)]">
          Converting <span className="text-[var(--dash-text)]">{companyName}</span>{" "}
          creates a permanent client conversion hub. Click{" "}
          <span className="text-[var(--dash-text)]">Convert to client</span>{" "}
          below when ready.
        </p>

        {dupLoading ? (
          <p className="font-inter text-sm text-[var(--dash-muted)]">
            Checking duplicates…
          </p>
        ) : null}

        {dupPreview ? (
          <>
            {dupPreview.vendors.length > 0 ? (
              <div className="space-y-3">
                <p className="font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)]">
                  Matching existing clients
                </p>
                <div className="space-y-2">
                  {dupPreview.vendors.map((v) => (
                    <label
                      key={v.vendorId}
                      className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-[var(--dash-border)] p-3 hover:bg-[var(--dash-hover)]"
                    >
                      <span className="min-w-0">
                        <span className="block font-inter text-sm">
                          {v.companyName}
                        </span>
                        <span className="block text-xs text-[var(--dash-muted)]">
                          {v.publicCode} · {v.email || v.phone || "—"}
                        </span>
                      </span>
                      <input
                        type="radio"
                        name="__vendorChoice"
                        checked={selectedVendorId === v.vendorId}
                        onChange={() => {
                          setSelectedVendorId(v.vendorId);
                          setForceNew(false);
                        }}
                      />
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--dash-border)] p-4">
                <p className="font-inter text-sm text-[var(--dash-muted)]">
                  No duplicate client found — a new conversion will be created.
                </p>
              </div>
            )}
          </>
        ) : null}

        <label className="flex items-center gap-2 font-inter text-sm">
          <input
            type="checkbox"
            name="forceNew"
            value="on"
            checked={forceNew}
            onChange={(e) => setForceNew(e.target.checked)}
          />
          Force a new client relationship (advanced)
        </label>
      </div>
    </OsActionForm>
  );
}

export { Field, osInputClass, osTextareaClass };
