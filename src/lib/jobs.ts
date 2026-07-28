import type { FormFieldType } from "@/lib/constants";
import { JOB_FILE_MAX_MB } from "@/lib/constants";

export type FormFieldOption = {
  value: string;
  label: string;
};

export type FormFieldDef = {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options?: FormFieldOption[];
  accept?: string;
  maxSizeMb?: number;
};

export type FileAnswerValue = {
  name: string;
  mimeType: string;
  size: number;
  dataBase64: string;
};

export type AnswerValue = string | string[] | boolean | FileAnswerValue;

export type ApplicationAnswer = {
  fieldId: string;
  label: string;
  type: FormFieldType;
  value: AnswerValue;
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function newFieldId(): string {
  return `f_${Math.random().toString(36).slice(2, 10)}`;
}

/** Default apply form for new jobs. */
export function defaultJobFormFields(): FormFieldDef[] {
  return [
    {
      id: newFieldId(),
      type: "short_text",
      label: "Full name",
      placeholder: "Your full name",
      required: true,
    },
    {
      id: newFieldId(),
      type: "email",
      label: "Email",
      placeholder: "you@example.com",
      required: true,
    },
    {
      id: newFieldId(),
      type: "phone",
      label: "Phone",
      placeholder: "+91 …",
      required: true,
    },
    {
      id: newFieldId(),
      type: "file",
      label: "Resume",
      helpText: `PDF or Word, max ${JOB_FILE_MAX_MB}MB`,
      required: true,
      accept:
        ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      maxSizeMb: JOB_FILE_MAX_MB,
    },
    {
      id: newFieldId(),
      type: "long_text",
      label: "Cover letter",
      placeholder: "Tell us why you're a fit…",
      required: false,
    },
  ];
}

export function fieldNeedsOptions(type: FormFieldType): boolean {
  return type === "select" || type === "radio" || type === "multi_checkbox";
}

/** Pull name/email from answers when labels or types match. */
export function denormalizeApplicant(answers: ApplicationAnswer[]): {
  applicantName: string;
  applicantEmail: string;
} {
  let applicantName = "";
  let applicantEmail = "";

  for (const a of answers) {
    const label = a.label.toLowerCase();
    if (
      !applicantName &&
      a.type === "short_text" &&
      (label.includes("name") || label === "full name")
    ) {
      if (typeof a.value === "string") applicantName = a.value.trim();
    }
    if (!applicantEmail && a.type === "email") {
      if (typeof a.value === "string") applicantEmail = a.value.trim().toLowerCase();
    }
  }

  if (!applicantName) {
    const firstText = answers.find(
      (a) => a.type === "short_text" && typeof a.value === "string" && a.value
    );
    if (firstText && typeof firstText.value === "string") {
      applicantName = firstText.value.trim();
    }
  }

  return {
    applicantName: applicantName || "Applicant",
    applicantEmail: applicantEmail || "",
  };
}

export function isFileAnswer(value: unknown): value is FileAnswerValue {
  return (
    !!value &&
    typeof value === "object" &&
    "dataBase64" in value &&
    "name" in value &&
    typeof (value as FileAnswerValue).dataBase64 === "string"
  );
}
