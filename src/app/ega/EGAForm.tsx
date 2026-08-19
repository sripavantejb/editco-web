"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitEGAApplication } from "@/actions/ega";
import type { ActionState } from "@/actions/auth";
import SideRays from "@/components/referral/SideRays";
import { AGREEMENT_ITEMS } from "@/lib/ega";
import type { EGAFormConfigData, EGAQuestion } from "@/lib/ega-form";

const EDITCO_LOGO =
  "https://res.cloudinary.com/dxeoibunj/image/upload/v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht.png";

const ACCENT = "#c3a4f6";

const inputCls =
  "w-full rounded-xl border border-[var(--careers-border)] bg-black/30 px-3 py-2.5 text-sm text-[var(--careers-text)] placeholder:text-[var(--careers-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--careers-accent)]";
const labelCls =
  "mb-1.5 block text-sm font-medium text-[var(--careers-muted)]";

const FIELD_MIN: Record<string, { min: number; message: string }> = {
  fullName: { min: 2, message: "Please enter your full name." },
  phone: { min: 7, message: "Please enter a valid phone / WhatsApp number." },
  college: { min: 2, message: "Please enter your college / university." },
  about: { min: 20, message: "Tell us about yourself in at least a few lines." },
  salesExperience: {
    min: 10,
    message: "Please briefly describe your sales experience.",
  },
  websiteObjection: {
    min: 10,
    message: "Please share how you would respond.",
  },
  rejectionResponse: {
    min: 10,
    message: "Please share what you would do next.",
  },
  whySelect: {
    min: 20,
    message: "Tell us why Editco should select you.",
  },
};

const ERROR_STEP: Record<string, number> = {
  "Full name is required": 1,
  "Valid email required": 1,
  "Phone / WhatsApp number is required": 1,
  "College / University is required": 1,
  "Tell us about yourself in 3–5 lines": 1,
  "Select at least one interest": 1,
  "Select at least one industry": 2,
  "Select where your strongest network comes from": 2,
  "Please briefly describe your sales experience": 3,
  "Please share how you would respond": 4,
  "Please share what you would do next": 4,
  "Select at least one Editco service": 5,
  "Tell us why Editco should select you": 5,
  "Please agree to the Terms and Conditions": 5,
};

const TOTAL_SECTIONS = 5;
const DRAFT_KEY = "ega-form-draft-v2";
const MULTI_FIELDS = new Set([
  "interests",
  "industries",
  "networkSources",
  "services",
]);

type DraftValues = Record<string, string | string[]>;

type Draft = {
  step: number;
  soldBefore: string;
  noExampleYet: boolean;
  termsAccepted: boolean;
  termsViewed: boolean;
  values: DraftValues;
};

function readDraft(): Draft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Draft;
    if (!parsed || typeof parsed.step !== "number") return null;
    parsed.step = Math.min(TOTAL_SECTIONS, Math.max(0, parsed.step));
    return parsed;
  } catch {
    return null;
  }
}

function writeDraft(draft: Draft) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}

function collectValues(
  form: HTMLFormElement | null,
  extraMulti: Set<string> = new Set()
): DraftValues {
  if (!form) return {};
  const fd = new FormData(form);
  const values: DraftValues = {};
  for (const key of new Set(fd.keys())) {
    if (MULTI_FIELDS.has(key) || extraMulti.has(key))
      values[key] = fd.getAll(key).map(String);
    else values[key] = String(fd.get(key) || "");
  }
  return values;
}

function strVal(values: DraftValues, name: string) {
  const v = values[name];
  return Array.isArray(v) ? v[0] || "" : v || "";
}

function listVal(values: DraftValues, name: string) {
  const v = values[name];
  if (Array.isArray(v)) return v;
  return v ? [v] : [];
}

const STEP_COPY: Record<number, { kicker: string; title: string }> = {
  1: { kicker: "1 / 5", title: "You" },
  2: { kicker: "2 / 5", title: "Your network" },
  3: { kicker: "3 / 5", title: "Sales" },
  4: { kicker: "4 / 5", title: "Scenarios" },
  5: { kicker: "5 / 5", title: "Apply" },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="careers-theme relative flex min-h-svh items-center justify-center overflow-x-clip bg-[#050505] px-4 py-16 sm:px-6 sm:py-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <SideRays
          rayColor1={ACCENT}
          rayColor2="#96c8ff"
          intensity={0.55}
          origin="top-right"
        />
        <div className="ega-grid absolute inset-0" />
      </div>
      <div className="relative z-10 w-full max-w-2xl">{children}</div>
    </main>
  );
}

export function EGAForm({ config }: { config: EGAFormConfigData }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    submitEGAApplication,
    {}
  );
  const [ready, setReady] = useState(false);
  const [soldBefore, setSoldBefore] = useState("");
  const [noExampleYet, setNoExampleYet] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsViewed, setTermsViewed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState("");
  const [values, setValues] = useState<DraftValues>({});
  const formRef = useRef<HTMLFormElement>(null);
  const skipScroll = useRef(true);
  const multiNames = new Set(
    config.questions
      .filter((q) => q.type === "multi_checkbox")
      .map((q) => q.name)
  );

  useEffect(() => {
    const saved = readDraft();
    if (saved) {
      setStep(saved.step);
      setSoldBefore(saved.soldBefore || "");
      setNoExampleYet(Boolean(saved.noExampleYet));
      setTermsAccepted(Boolean(saved.termsAccepted));
      setTermsViewed(Boolean(saved.termsViewed || saved.termsAccepted));
      setTermsOpen(false);
      setValues(saved.values || {});
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (state.success) clearDraft();
  }, [state.success]);

  useEffect(() => {
    if (!state.error) return;
    const target = ERROR_STEP[state.error];
    if (target) setStep(target);
    setStepError(state.error);
  }, [state.error]);

  useEffect(() => {
    if (!ready) return;
    if (skipScroll.current) {
      skipScroll.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step, ready]);

  const persist = (
    nextStep = step,
    extras?: Partial<
      Pick<Draft, "soldBefore" | "noExampleYet" | "termsAccepted" | "termsViewed">
    >
  ) => {
    const nextValues = {
      ...values,
      ...collectValues(formRef.current, multiNames),
    };
    setValues(nextValues);
    writeDraft({
      step: nextStep,
      soldBefore: extras?.soldBefore ?? soldBefore,
      noExampleYet: extras?.noExampleYet ?? noExampleYet,
      termsAccepted: extras?.termsAccepted ?? termsAccepted,
      termsViewed: extras?.termsViewed ?? termsViewed,
      values: nextValues,
    });
  };

  if (!ready) {
    return <main className="careers-theme min-h-svh bg-[#050505]" />;
  }

  if (state.success) {
    return (
      <Shell>
        <div className="rounded-[28px] border border-[var(--careers-accent)]/35 bg-white/[0.05] p-8 text-center backdrop-blur-xl sm:p-12">
          <div className="ega-check-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--careers-accent)] text-[var(--careers-on-accent)]">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              aria-hidden
            >
              <path d="M5 12.5 9.5 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="mt-5 font-archivo text-[10px] uppercase tracking-[0.22em] text-[var(--careers-accent)]">
            Editco Growth Associate
          </p>
          <h1 className="mt-3 font-archivo text-3xl tracking-tight text-white sm:text-4xl">
            Application received
          </h1>
          <p className="mt-4 font-inter text-base leading-relaxed text-white/70">
            Thank you for applying. Shortlisted candidates will be contacted by{" "}
            <span className="text-white">email and WhatsApp</span>.
          </p>
          <p className="mt-3 font-inter text-sm leading-relaxed text-white/55">
            Keep this tab open or take a screenshot if you want a record of your
            submission.
          </p>
          <p className="mt-8 font-inter text-sm leading-relaxed text-[var(--careers-accent)]">
            You don&apos;t need to know everything. You just need to be willing
            to learn, connect and build.
          </p>
          <p className="mt-6 font-archivo text-xs uppercase tracking-[0.16em] text-white/45">
            — Team Editco
          </p>
        </div>
      </Shell>
    );
  }

  const goNext = () => {
    const message = validateSection(
      formRef.current?.querySelector<HTMLElement>(`[data-step="${step}"]`) ??
        null
    );
    if (message) {
      setStepError(message);
      return;
    }
    setStepError("");
    const next = Math.min(TOTAL_SECTIONS, step + 1);
    persist(next);
    setStep(next);
  };

  const goBack = () => {
    setStepError("");
    const next = Math.max(0, step - 1);
    persist(next);
    setStep(next);
  };

  const copy = {
    kicker: `${step} / ${TOTAL_SECTIONS}`,
    title: config.copy.sectionTitles[step as 1 | 2 | 3 | 4 | 5] || STEP_COPY[step]?.title || "",
  };

  return (
    <Shell>
      {step === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 text-center backdrop-blur-xl sm:p-10">
          <div className="mx-auto h-7 w-7 sm:h-8 sm:w-8">
            <img
              src={EDITCO_LOGO}
              alt="Editco"
              className="h-full w-full object-contain"
            />
          </div>
          <p className="mt-5 font-archivo text-[10px] uppercase tracking-[0.22em] text-[var(--careers-accent)]">
            {config.copy.introKicker}
          </p>
          <h1 className="mt-3 font-archivo text-[clamp(1.65rem,5vw,2.35rem)] leading-tight tracking-tight text-white">
            {config.copy.introTitle}
          </h1>
          <p className="mx-auto mt-3 inline-flex rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] text-white/60">
            {config.copy.introMinutes}
          </p>
          <p className="mx-auto mt-5 max-w-lg text-left font-inter text-sm leading-relaxed text-white/65">
            {config.copy.introBody}
          </p>
          <ul className="mx-auto mt-4 max-w-lg space-y-2 text-left font-inter text-sm leading-relaxed text-white/70">
            {config.copy.introBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4">
            <HowItWorks
              title="Reach"
              body="People you already know"
              icon="reach"
            />
            <HowItWorks
              title="Pitch"
              body="Spot a need, start a talk"
              icon="pitch"
            />
            <HowItWorks
              title="We deliver"
              body="Editco builds the work"
              icon="deliver"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              persist(1);
              setStep(1);
            }}
            className="careers-cta mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 font-archivo text-sm uppercase tracking-[0.08em] sm:w-auto sm:min-w-[220px]"
          >
            {strVal(values, "fullName")
              ? "Continue application"
              : "Start application"}
          </button>
        </div>
      ) : (
        <div className="mb-6 text-center">
          <p className="font-archivo text-[10px] uppercase tracking-[0.22em] text-[var(--careers-accent)]">
            {copy.kicker}
          </p>
          <h1 className="mt-2 font-archivo text-[clamp(1.35rem,4vw,1.85rem)] tracking-tight text-white">
            {copy.title}
          </h1>
          <div className="mx-auto mt-5 h-1.5 max-w-xs overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[var(--careers-accent)] transition-all duration-300"
              style={{ width: `${(step / TOTAL_SECTIONS) * 100}%` }}
            />
          </div>
        </div>
      )}

      <form
        ref={formRef}
        action={formAction}
        noValidate
        onChange={() => {
          persist(step);
          setStepError("");
        }}
        onSubmit={(e) => {
          for (let s = 1; s <= TOTAL_SECTIONS; s += 1) {
            const message = validateSection(
              formRef.current?.querySelector<HTMLElement>(
                `[data-step="${s}"]`
              ) ?? null
            );
            if (message) {
              e.preventDefault();
              setStep(s);
              setStepError(message);
              return;
            }
          }
        }}
        className={step === 0 ? "hidden" : "space-y-5"}
      >
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <SectionCard key={n} step={n} active={step === n}>
            {config.questions
              .filter((q) => q.section === n)
              .map((q) => (
                <DynamicQuestion
                  key={q.name}
                  q={q}
                  values={values}
                  soldBefore={soldBefore}
                  onSoldBefore={(value) => {
                    setSoldBefore(value);
                    persist(step, { soldBefore: value });
                  }}
                  noExampleYet={noExampleYet}
                  onNoExampleYet={(checked) => {
                    setNoExampleYet(checked);
                    persist(step, { noExampleYet: checked });
                  }}
                />
              ))}
            {n === 5 ? (
          <div className="border-t border-white/10 pt-5">
            <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-[var(--careers-accent)]">
              Terms and Conditions
            </p>
            <p className="mt-2 text-sm text-white/60">
              View the terms once, then confirm with the checkbox.
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-[var(--careers-border)] bg-black/20">
              <div className="flex items-center gap-3 px-4 py-3">
                <label
                  className={`flex flex-1 items-center gap-2.5 text-sm text-[var(--careers-text)] ${
                    termsViewed ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    value="yes"
                    required
                    disabled={!termsViewed}
                    checked={termsAccepted}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setTermsAccepted(checked);
                      persist(step, { termsAccepted: checked });
                    }}
                    className="sr-only"
                  />
                  <CheckMark checked={termsAccepted} disabled={!termsViewed} />
                  <span>
                    I agree to the{" "}
                    <span className="text-[var(--careers-accent)]">
                      Terms and Conditions
                    </span>
                  </span>
                </label>
                <button
                  type="button"
                  aria-expanded={termsOpen}
                  onClick={() => {
                    setTermsOpen((open) => !open);
                    if (!termsViewed) {
                      setTermsViewed(true);
                      persist(step, { termsViewed: true });
                    }
                  }}
                  className="shrink-0 rounded-full px-2 py-1 text-[11px] uppercase tracking-[0.12em] text-[var(--careers-accent)]"
                >
                  {termsOpen ? "Hide" : "View"}
                </button>
              </div>
              {termsOpen ? (
                <ul className="space-y-2 border-t border-white/10 px-4 py-4 text-sm leading-relaxed text-white/65">
                  {AGREEMENT_ITEMS.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--careers-accent)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
            ) : null}
          </SectionCard>
        ))}

        {stepError ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200">
            {stepError}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 font-archivo text-xs uppercase tracking-[0.1em] text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Back
          </button>
          {step < TOTAL_SECTIONS ? (
            <button
              type="button"
              onClick={goNext}
              className="careers-cta inline-flex min-h-12 items-center justify-center rounded-full px-8 font-archivo text-sm uppercase tracking-[0.08em]"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={pending}
              className="careers-cta inline-flex min-h-12 items-center justify-center rounded-full px-8 font-archivo text-sm uppercase tracking-[0.08em] disabled:opacity-60"
            >
              {pending ? "Submitting…" : "Submit application"}
            </button>
          )}
        </div>
      </form>
    </Shell>
  );
}

function HowItWorks({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon: "reach" | "pitch" | "deliver";
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-2 py-3 sm:px-3 sm:py-4">
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-[var(--careers-accent)]/40 text-[var(--careers-accent)]">
        {icon === "reach" ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <circle cx="8" cy="10" r="2.2" />
            <circle cx="16" cy="10" r="2.2" />
            <path d="M4.5 17c.6-2 1.9-3 3.5-3s2.9 1 3.5 3M12.5 17c.6-2 1.9-3 3.5-3s2.9 1 3.5 3" strokeLinecap="round" />
          </svg>
        ) : icon === "pitch" ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M4 19V8l8-4 8 4v11" strokeLinejoin="round" />
            <path d="M12 11v8M8 19v-5h8v5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <rect x="4" y="5" width="16" height="14" rx="2" />
            <path d="M8 13l2.5 2.5L16 10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <p className="mt-2 font-archivo text-[11px] uppercase tracking-[0.12em] text-white">
        {title}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-white/50">{body}</p>
    </div>
  );
}

function validateSection(section: HTMLElement | null) {
  if (!section) return "Please complete this section before continuing.";

  const controls = section.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >("input, textarea, select");

  for (const control of controls) {
    if (
      control instanceof HTMLInputElement &&
      control.name === "termsAccepted" &&
      !control.checked
    ) {
      return "Please agree to the Terms and Conditions.";
    }
    if (control.disabled) continue;
    const rule = FIELD_MIN[control.name];
    const value = control.value.trim();

    if (control.type === "radio") {
      continue;
    }
    if (control instanceof HTMLInputElement && control.type === "checkbox") {
      if (control.required && !control.checked) {
        control.reportValidity();
        return "Please agree to the Terms and Conditions.";
      }
      continue;
    }

    if (control instanceof HTMLInputElement && control.type === "email") {
      if (!value) return "Please enter your email address.";
      if (!control.checkValidity()) {
        control.reportValidity();
        return "Please enter a valid email address.";
      }
    }

    if (control instanceof HTMLSelectElement && control.required && !value) {
      control.focus();
      return "Please complete this section before continuing.";
    }

    if (rule) {
      if (value.length < rule.min) {
        control.focus();
        return rule.message;
      }
    } else if (control.required && !value) {
      control.focus();
      return "Please complete this section before continuing.";
    }
  }

  const radioNames = new Set<string>();
  for (const radio of section.querySelectorAll<HTMLInputElement>(
    'input[type="radio"][required]'
  )) {
    radioNames.add(radio.name);
  }
  for (const name of radioNames) {
    const checked = section.querySelector(
      `input[name="${CSS.escape(name)}"]:checked`
    );
    if (!checked) {
      return "Please choose an option to continue.";
    }
  }

  for (const group of section.querySelectorAll<HTMLElement>("[data-min-one]")) {
    const name = group.dataset.minOne;
    if (!name) continue;
    const checked = section.querySelectorAll(
      `input[name="${CSS.escape(name)}"]:checked`
    );
    if (checked.length === 0) {
      return "Please select at least one option.";
    }
  }

  return null;
}

function SectionCard({
  step,
  active,
  children,
}: {
  step: number;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      data-step={step}
      className={
        active
          ? "space-y-6 rounded-[24px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl sm:p-7"
          : "hidden"
      }
    >
      {children}
    </section>
  );
}

function DynamicQuestion({
  q,
  values,
  soldBefore,
  onSoldBefore,
  noExampleYet,
  onNoExampleYet,
}: {
  q: EGAQuestion;
  values: DraftValues;
  soldBefore: string;
  onSoldBefore: (value: string) => void;
  noExampleYet: boolean;
  onNoExampleYet: (checked: boolean) => void;
}) {
  if (q.name === "salesExperience" && soldBefore !== "Yes") return null;

  const options = q.options || [];
  const required = q.required;

  if (q.name === "exampleBusiness") {
    return (
      <div className="space-y-3">
        <p className={labelCls}>
          {q.label}
          {required ? (
            <span className="text-[var(--careers-accent)]"> *</span>
          ) : null}
        </p>
        {q.helpText ? (
          <p className="-mt-1 text-xs text-[var(--careers-faint)]">{q.helpText}</p>
        ) : null}
        <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-white/75">
          <input
            type="checkbox"
            name="noExampleYet"
            value="yes"
            checked={noExampleYet}
            onChange={(e) => onNoExampleYet(e.target.checked)}
            className="sr-only"
          />
          <CheckMark checked={noExampleYet} />
          <span>I don’t have a specific example yet.</span>
        </label>
        {!noExampleYet ? (
          <Area
            name={q.name}
            required={required}
            defaultValue={strVal(values, q.name)}
            placeholder={q.placeholder}
          />
        ) : null}
      </div>
    );
  }

  if (q.type === "short_text" || q.type === "email" || q.type === "phone") {
    return (
      <Field
        label={q.label}
        name={q.name}
        type={q.type === "phone" ? "tel" : q.type === "email" ? "email" : "text"}
        required={required}
        placeholder={q.placeholder}
        defaultValue={strVal(values, q.name)}
      />
    );
  }
  if (q.type === "long_text") {
    return (
      <div>
        {q.helpText ? (
          <p className="mb-1 text-xs text-[var(--careers-faint)]">{q.helpText}</p>
        ) : null}
        <Area
          label={q.label}
          name={q.name}
          required={required || (q.name === "salesExperience" && soldBefore === "Yes")}
          defaultValue={strVal(values, q.name)}
          hintMin={FIELD_MIN[q.name]?.min}
          placeholder={q.placeholder}
        />
      </div>
    );
  }
  if (q.type === "select") {
    return (
      <SelectField
        label={q.label}
        name={q.name}
        options={options}
        required={required}
        defaultValue={strVal(values, q.name)}
      />
    );
  }
  if (q.type === "radio") {
    return (
      <RadioGroup
        label={q.label}
        name={q.name}
        options={options}
        required={required}
        selected={
          q.name === "soldBefore"
            ? soldBefore || strVal(values, q.name)
            : strVal(values, q.name)
        }
        onChange={q.name === "soldBefore" ? onSoldBefore : undefined}
      />
    );
  }
  if (q.type === "multi_checkbox") {
    return (
      <PillGroup
        label={q.label}
        name={q.name}
        options={options}
        multiple
        required={required}
        max={q.max}
        hint={q.helpText}
        selected={listVal(values, q.name)}
      />
    );
  }
  if (q.type === "scale") {
    return (
      <Scale
        label={q.label}
        name={q.name}
        low={q.scaleLow || "Low"}
        high={q.scaleHigh || "High"}
        selected={strVal(values, q.name)}
      />
    );
  }
  return null;
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelCls}>
        {label}
        {required ? (
          <span className="text-[var(--careers-accent)]"> *</span>
        ) : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className={inputCls}
      />
    </div>
  );
}

function CheckMark({
  checked,
  disabled,
}: {
  checked: boolean;
  disabled?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition ${
        checked
          ? "border-[var(--careers-accent)] bg-[var(--careers-accent)] text-[var(--careers-on-accent)]"
          : "border-white/40 bg-black/50"
      } ${disabled ? "opacity-50" : ""}`}
    >
      {checked ? (
        <svg
          viewBox="0 0 16 16"
          className="h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
        >
          <path
            d="M3.5 8.5 6.5 11.5 12.5 4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

function SelectField({
  label,
  name,
  options,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  options: readonly string[];
  required?: boolean;
  defaultValue?: string;
}) {
  const [value, setValue] = useState(defaultValue || "");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const pick = (option: string) => {
    const el = selectRef.current;
    if (el) {
      el.value = option;
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }
    setValue(option);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={name} className={labelCls}>
        {label}
        {required ? (
          <span className="text-[var(--careers-accent)]"> *</span>
        ) : null}
      </label>
      <select
        ref={selectRef}
        id={name}
        name={name}
        required={required}
        defaultValue={defaultValue || ""}
        className="hidden"
      >
        <option value="" disabled>
          Select
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={name}
        onClick={() => setOpen((v) => !v)}
        className={`${inputCls} flex items-center justify-between gap-3 text-left`}
      >
        <span className={value ? "text-[var(--careers-text)]" : "text-[var(--careers-faint)]"}>
          {value || "Select"}
        </span>
        <svg
          viewBox="0 0 16 16"
          className={`h-4 w-4 shrink-0 text-white/50 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden
        >
          <path d="M3.5 6 8 10.5 12.5 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-xl border border-[var(--careers-border)] bg-[#161616] py-1 shadow-[0_16px_40px_rgba(0,0,0,0.55)]"
        >
          {options.map((option) => (
            <li key={option} role="option" aria-selected={value === option}>
              <button
                type="button"
                onClick={() => pick(option)}
                className={`flex min-h-10 w-full items-center px-3 text-left text-sm transition ${
                  value === option
                    ? "bg-[var(--careers-accent-soft)] text-white"
                    : "text-white/80 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function Area({
  label,
  name,
  required,
  disabled,
  defaultValue,
  minLength,
  hintMin,
  placeholder,
}: {
  label?: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  minLength?: number;
  hintMin?: number;
  placeholder?: string;
}) {
  const [len, setLen] = useState(defaultValue?.length ?? 0);
  const min = hintMin ?? minLength;
  return (
    <div>
      {label ? (
        <label htmlFor={name} className={labelCls}>
          {label}
          {required ? (
            <span className="text-[var(--careers-accent)]"> *</span>
          ) : null}
        </label>
      ) : null}
      <textarea
        id={name}
        name={name}
        required={required}
        disabled={disabled}
        defaultValue={defaultValue}
        minLength={minLength}
        placeholder={placeholder}
        rows={4}
        onInput={(e) => setLen(e.currentTarget.value.trim().length)}
        className={`${inputCls} min-h-[96px] disabled:opacity-50`}
      />
      {min ? (
        <p className="mt-1 text-[11px] text-[var(--careers-faint)]">
          {len < min
            ? `${min - len} more characters`
            : `${len} characters`}
        </p>
      ) : null}
    </div>
  );
}

function RadioGroup({
  label,
  name,
  options,
  required,
  onChange,
  selected,
}: {
  label: string;
  name: string;
  options: readonly string[];
  required?: boolean;
  onChange?: (value: string) => void;
  selected?: string;
}) {
  return (
    <fieldset>
      <legend className={labelCls}>
        {label}
        {required ? (
          <span className="text-[var(--careers-accent)]"> *</span>
        ) : null}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-[var(--careers-border)] bg-black/20 px-4 text-sm text-[var(--careers-text)] has-[:checked]:border-[var(--careers-accent)] has-[:checked]:bg-[var(--careers-accent-soft)] has-[:checked]:text-white"
          >
            <input
              type="radio"
              name={name}
              value={option}
              required={required}
              defaultChecked={selected === option}
              className="sr-only"
              onChange={() => onChange?.(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function PillGroup({
  label,
  name,
  options,
  multiple,
  required,
  selected,
  max,
  hint,
}: {
  label: string;
  name: string;
  options: readonly string[];
  multiple?: boolean;
  required?: boolean;
  selected?: string[];
  max?: number;
  hint?: string;
}) {
  const [chosen, setChosen] = useState(selected || []);
  const atMax = Boolean(max && chosen.length >= max);

  return (
    <fieldset data-min-one={required ? name : undefined}>
      <legend className={labelCls}>
        {label}
        {required ? (
          <span className="text-[var(--careers-accent)]"> *</span>
        ) : null}
      </legend>
      {hint ? (
        <p className="-mt-1 mb-2 text-xs text-[var(--careers-faint)]">{hint}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isOn = chosen.includes(option);
          const blocked = Boolean(multiple && atMax && !isOn);
          return (
            <label
              key={option}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--careers-border)] bg-black/20 px-4 text-sm text-[var(--careers-text)] has-[:checked]:border-[var(--careers-accent)] has-[:checked]:bg-[var(--careers-accent-soft)] has-[:checked]:text-white ${
                blocked ? "cursor-not-allowed opacity-40" : "cursor-pointer"
              }`}
            >
              <input
                type={multiple ? "checkbox" : "radio"}
                name={name}
                value={option}
                checked={isOn}
                disabled={blocked}
                onChange={(e) => {
                  if (!multiple) {
                    setChosen([option]);
                    return;
                  }
                  if (e.target.checked) {
                    if (max && chosen.length >= max) return;
                    setChosen([...chosen, option]);
                  } else {
                    setChosen(chosen.filter((v) => v !== option));
                  }
                }}
                className="sr-only"
              />
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Scale({
  label,
  name,
  low,
  high,
  selected,
}: {
  label: string;
  name: string;
  low: string;
  high: string;
  selected?: string;
}) {
  return (
    <fieldset>
      <legend className={labelCls}>
        {label}
        <span className="text-[var(--careers-accent)]"> *</span>
      </legend>
      <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--careers-faint)]">
        <span>1 — {low}</span>
        <span>5 — {high}</span>
      </div>
      <div className="mt-2 flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-xl border border-[var(--careers-border)] bg-black/20 font-archivo text-sm text-white has-[:checked]:border-[var(--careers-accent)] has-[:checked]:bg-[var(--careers-accent)] has-[:checked]:text-[var(--careers-on-accent)]"
          >
            <input
              type="radio"
              name={name}
              value={n}
              required
              defaultChecked={selected === String(n)}
              className="sr-only"
            />
            {n}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
