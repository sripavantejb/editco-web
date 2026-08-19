import {
  DURATION_OPTIONS,
  INDUSTRY_OPTIONS,
  INTEREST_OPTIONS,
  NETWORK_SIZE_OPTIONS,
  NETWORK_SOURCE_OPTIONS,
  PERFORMANCE_OPTIONS,
  SERVICE_OPTIONS,
  SPECIALIZATION_OPTIONS,
  WEEKLY_HOURS_OPTIONS,
  YEAR_OPTIONS,
} from "@/lib/ega";

export const EGA_QUESTION_TYPES = [
  "short_text",
  "long_text",
  "email",
  "phone",
  "select",
  "radio",
  "multi_checkbox",
  "scale",
] as const;

export type EGAQuestionType = (typeof EGA_QUESTION_TYPES)[number];

export type EGAQuestion = {
  name: string;
  section: 1 | 2 | 3 | 4 | 5;
  type: EGAQuestionType;
  label: string;
  helpText?: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  max?: number;
  scaleLow?: string;
  scaleHigh?: string;
};

export type EGAFormCopy = {
  introKicker: string;
  introTitle: string;
  introMinutes: string;
  introBody: string;
  introBullets: string[];
  sectionTitles: Record<1 | 2 | 3 | 4 | 5, string>;
};

export type EGAFormConfigData = {
  copy: EGAFormCopy;
  questions: EGAQuestion[];
};

const opts = (values: readonly string[]) => [...values];

export function defaultEGAFormCopy(): EGAFormCopy {
  return {
    introKicker: "Growth Associate",
    introTitle: "Join the program",
    introMinutes: "About 8–10 minutes · 5 sections",
    introBody:
      "Editco builds digital products for businesses. Growth Associates find companies that need that work, start the conversation, and bring opportunities to our team.",
    introBullets: [
      "Real business development and sales — not a certificate.",
      "You open doors. Editco handles strategy, design, and build.",
      "Performance-based earnings, with training and onboarding.",
    ],
    sectionTitles: {
      1: "You",
      2: "Your network",
      3: "Sales",
      4: "Scenarios",
      5: "Apply",
    },
  };
}

export function defaultEGAQuestions(): EGAQuestion[] {
  return [
    { name: "fullName", section: 1, type: "short_text", label: "Full Name", required: true },
    { name: "email", section: 1, type: "email", label: "Email Address", required: true },
    { name: "phone", section: 1, type: "phone", label: "Phone / WhatsApp Number", required: true },
    { name: "college", section: 1, type: "short_text", label: "College / University", required: true },
    {
      name: "yearOfStudy",
      section: 1,
      type: "select",
      label: "Current year of study",
      required: true,
      options: opts(YEAR_OPTIONS),
    },
    {
      name: "specialization",
      section: 1,
      type: "select",
      label: "BBA specialization",
      required: true,
      options: opts(SPECIALIZATION_OPTIONS),
    },
    { name: "city", section: 1, type: "short_text", label: "City", required: false },
    {
      name: "about",
      section: 1,
      type: "long_text",
      label: "Tell us about yourself in 3–5 lines.",
      required: true,
    },
    {
      name: "interests",
      section: 1,
      type: "multi_checkbox",
      label: "What interests you the most?",
      helpText: "Pick up to 3",
      required: true,
      options: opts(INTEREST_OPTIONS),
      max: 3,
    },
    {
      name: "knowsOwners",
      section: 2,
      type: "radio",
      label: "Do you personally know any business owners or professionals?",
      required: true,
      options: ["Yes", "No"],
    },
    {
      name: "networkSize",
      section: 2,
      type: "radio",
      label: "How many can you reach directly?",
      required: true,
      options: opts(NETWORK_SIZE_OPTIONS),
    },
    {
      name: "industries",
      section: 2,
      type: "multi_checkbox",
      label: "Which industries can you connect us with?",
      required: true,
      options: opts(INDUSTRY_OPTIONS),
    },
    {
      name: "networkSources",
      section: 2,
      type: "multi_checkbox",
      label: "Where does your strongest network come from?",
      required: true,
      options: opts(NETWORK_SOURCE_OPTIONS),
    },
    {
      name: "soldBefore",
      section: 3,
      type: "radio",
      label: "Have you ever sold a product or service?",
      required: true,
      options: ["Yes", "No"],
    },
    {
      name: "salesExperience",
      section: 3,
      type: "long_text",
      label: "Tell us briefly about your sales experience.",
      required: false,
    },
    {
      name: "comfortApproach",
      section: 3,
      type: "scale",
      label: "How comfortable are you approaching someone you've never spoken to before?",
      required: true,
      scaleLow: "Very uncomfortable",
      scaleHigh: "Very comfortable",
    },
    {
      name: "comfortColdCall",
      section: 3,
      type: "scale",
      label: "How comfortable are you with cold calling?",
      required: true,
      scaleLow: "Not comfortable",
      scaleHigh: "Very comfortable",
    },
    {
      name: "comfortOutreach",
      section: 3,
      type: "scale",
      label: "How comfortable are you with LinkedIn / Instagram outreach?",
      required: true,
      scaleLow: "Not comfortable",
      scaleHigh: "Very comfortable",
    },
    {
      name: "websiteObjection",
      section: 4,
      type: "long_text",
      label: 'They say: "We already have a website." How do you respond?',
      required: true,
      placeholder:
        "A website is a start — I’d ask how they get leads, follow up, and close…",
    },
    {
      name: "rejectionResponse",
      section: 4,
      type: "long_text",
      label: "You contacted 20 businesses. 17 said no. What next?",
      required: true,
      placeholder:
        "I’d review what I said, tighten the pitch, and keep going with the next 20…",
    },
    {
      name: "services",
      section: 5,
      type: "multi_checkbox",
      label: "Which Editco services interest you the most?",
      helpText: "Not sure yet? Choose that chip — we train you.",
      required: true,
      options: opts(SERVICE_OPTIONS),
    },
    {
      name: "exampleBusiness",
      section: 5,
      type: "long_text",
      label: "Name one business that could benefit from Editco, and why.",
      helpText: "Do not include private contact details.",
      required: false,
      placeholder: "A local clinic still booking on WhatsApp…",
    },
    {
      name: "weeklyHours",
      section: 5,
      type: "radio",
      label: "Hours you can realistically give each week",
      required: true,
      options: opts(WEEKLY_HOURS_OPTIONS),
    },
    {
      name: "performanceBased",
      section: 5,
      type: "radio",
      label: "Comfortable with performance-based earnings?",
      required: true,
      options: opts(PERFORMANCE_OPTIONS),
    },
    {
      name: "training",
      section: 5,
      type: "radio",
      label: "Willing to join training and onboarding?",
      required: true,
      options: ["Yes", "No"],
    },
    {
      name: "duration",
      section: 5,
      type: "radio",
      label: "How long do you see yourself with Editco?",
      required: true,
      options: opts(DURATION_OPTIONS),
    },
    {
      name: "whySelect",
      section: 5,
      type: "long_text",
      label: "Why should Editco select you?",
      required: true,
    },
    {
      name: "linkedin",
      section: 5,
      type: "short_text",
      label: "LinkedIn Profile",
      required: false,
      placeholder: "https://linkedin.com/in/…",
    },
    {
      name: "anythingElse",
      section: 5,
      type: "long_text",
      label: "Anything else you’d like us to know?",
      required: false,
    },
  ];
}

export function defaultEGAFormConfig(): EGAFormConfigData {
  return {
    copy: defaultEGAFormCopy(),
    questions: defaultEGAQuestions(),
  };
}

export function slugQuestionName(label: string) {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
  return base || `q_${Math.random().toString(36).slice(2, 8)}`;
}

export const KNOWN_EGA_FIELD_NAMES = new Set(
  defaultEGAQuestions().map((q) => q.name)
);
