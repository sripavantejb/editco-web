export const EGA_STATUSES = [
  "pending",
  "selected",
  "lookback",
  "rejected",
] as const;
export type EGAStatus = (typeof EGA_STATUSES)[number];

export const EGA_STATUS_LABELS: Record<EGAStatus, string> = {
  pending: "Pending",
  selected: "Selected",
  lookback: "Lookback",
  rejected: "Rejected",
};

export function normalizeEGAStatus(status: string): EGAStatus {
  if (status === "shortlisted") return "selected";
  if ((EGA_STATUSES as readonly string[]).includes(status)) {
    return status as EGAStatus;
  }
  return "pending";
}

export function firstNameFrom(fullName: string) {
  return fullName.trim().split(/\s+/)[0] || "there";
}

export function egaWhatsAppUrl(phone: string, text: string) {
  const digits = phone.replace(/\D/g, "");
  const withCc =
    digits.length === 10
      ? `91${digits}`
      : digits.startsWith("0") && digits.length === 11
        ? `91${digits.slice(1)}`
        : digits;
  return `https://wa.me/${withCc}?text=${encodeURIComponent(text)}`;
}

export type EGAOutreachKind = "selected" | "lookback" | "rejected";

export function egaEmailTemplate(
  kind: EGAOutreachKind,
  fullName: string
): { subject: string; body: string } {
  const name = firstNameFrom(fullName);
  if (kind === "selected") {
    return {
      subject: "You're selected — Editco Growth Associate",
      body: `Hi ${name},

Congratulations. You have been selected for the Editco Growth Associate program.

Our team reviewed your application and we would like you to join the next stage — onboarding and training.

Please reply to this email to confirm that you are in, and we will share the onboarding schedule.

You don't need to know everything. You just need to be willing to learn, connect and build.

— Team Editco`,
    };
  }
  if (kind === "lookback") {
    return {
      subject: "Your Editco Growth Associate application — next look",
      body: `Hi ${name},

Thank you for applying to the Editco Growth Associate program.

We are keeping your application for a second look in this round. That means you are not rejected — we may come back to you after we finish the current shortlist.

Please stay reachable on this email and WhatsApp. If anything changes on your side, reply here.

— Team Editco`,
    };
  }
  return {
    subject: "Update on your Editco Growth Associate application",
    body: `Hi ${name},

Thank you for applying to the Editco Growth Associate program and for the time you put into the form.

We will not be moving forward with your application in this round. This is not a reflection of your potential — we had to make a tight selection.

We wish you the very best, and you are welcome to apply again in a future cycle.

— Team Editco`,
  };
}

export function egaWhatsAppTemplate(kind: EGAOutreachKind, fullName: string) {
  const name = firstNameFrom(fullName);
  if (kind === "selected") {
    return `Hi ${name}, this is Editco.

Congratulations — you have been selected as an Editco Growth Associate.

Please reply on this chat to confirm, and we will share onboarding details.

— Team Editco`;
  }
  if (kind === "lookback") {
    return `Hi ${name}, this is Editco.

Thank you for applying to the Growth Associate program. We are keeping your application for a second look and may reach you after this round.

Please stay reachable here.

— Team Editco`;
  }
  return `Hi ${name}, this is Editco.

Thank you for applying to the Growth Associate program. We will not be moving forward in this round.

We appreciate the effort and wish you all the best.

— Team Editco`;
}

export const YEAR_OPTIONS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Final Year",
  "Other",
] as const;

export const SPECIALIZATION_OPTIONS = [
  "General BBA",
  "Marketing",
  "Finance",
  "HR",
  "Business Analytics",
  "Entrepreneurship",
  "International Business",
  "Other",
] as const;

export const INTEREST_OPTIONS = [
  "Sales",
  "Business Development",
  "Marketing",
  "Entrepreneurship",
  "Client Management",
  "Networking",
  "Technology",
  "AI",
  "Leadership",
  "Finance",
  "Other",
] as const;

export const NETWORK_SIZE_OPTIONS = [
  "0",
  "1–5",
  "6–10",
  "11–25",
  "25–50",
  "50+",
] as const;

export const INDUSTRY_OPTIONS = [
  "Real Estate",
  "Healthcare",
  "Restaurants",
  "Hospitality",
  "Retail",
  "Education",
  "Finance",
  "Manufacturing",
  "Construction",
  "E-commerce",
  "Professional Services",
  "Local Businesses",
  "Startups",
  "Other",
] as const;

export const NETWORK_SOURCE_OPTIONS = [
  "Family",
  "Friends",
  "College",
  "Alumni",
  "Local Businesses",
  "Previous Work / Internship",
  "Social Media",
  "Professional Network",
  "Community",
  "Other",
] as const;

export const SERVICE_UNSURE = "Not sure yet";
export const SERVICE_UNSURE_LEGACY =
  "I want to know more about Editco — I don’t have a clear idea yet";

export const SERVICE_OPTIONS = [
  "Websites",
  "Custom Software",
  "CRM",
  "ERP",
  "HRMS",
  "AI Solutions",
  "Automation",
  "E-commerce",
  "Healthcare Solutions",
  "Real Estate Solutions",
  "Digital Marketing",
  "Other",
  SERVICE_UNSURE,
] as const;

export function normalizeServiceChoice(value: string) {
  if (value === SERVICE_UNSURE_LEGACY) return SERVICE_UNSURE;
  return value;
}

export const WEEKLY_HOURS_OPTIONS = [
  "1–3 hours",
  "3–5 hours",
  "5–10 hours",
  "10+ hours",
] as const;

export const PERFORMANCE_OPTIONS = [
  "Yes",
  "No",
  "I would like to understand the model better",
] as const;

export const DURATION_OPTIONS = [
  "Less than 3 months",
  "3–6 months",
  "6–12 months",
  "1+ year",
  "I want to build a long-term association",
] as const;

export const AGREEMENT_ITEMS = [
  "I understand that this is a performance-based opportunity.",
  "I understand that joining Editco does not guarantee a fixed income.",
  "I agree to represent Editco professionally.",
  "I understand that client payments and commercial agreements are handled by Editco.",
  "I agree to follow Editco's communication and client-handling guidelines.",
  "I understand that selection into the Growth Associate program is based on the application and subsequent evaluation.",
] as const;

export type EGAScoreBreakdown = {
  networkSize: number;
  networkDiversity: number;
  salesExperience: number;
  comfort: number;
  commitmentHours: number;
  longTermIntent: number;
  interestsBreadth: number;
  paragraphDepth: number;
};

export type EGAScoreInput = {
  networkSize: string;
  industries: string[];
  soldBefore: string;
  salesExperience: string;
  comfortApproach: number;
  comfortColdCall: number;
  comfortOutreach: number;
  weeklyHours: string;
  duration: string;
  interests: string[];
  about: string;
  whySelect: string;
  websiteObjection: string;
  rejectionResponse: string;
};

export function computeEGAScore(input: EGAScoreInput): {
  score: number;
  breakdown: EGAScoreBreakdown;
} {
  const networkSizeMap: Record<string, number> = {
    "0": 0,
    "1–5": 5,
    "6–10": 10,
    "11–25": 15,
    "25–50": 18,
    "50+": 20,
  };
  const hoursMap: Record<string, number> = {
    "1–3 hours": 2,
    "3–5 hours": 5,
    "5–10 hours": 8,
    "10+ hours": 10,
  };
  const durationMap: Record<string, number> = {
    "Less than 3 months": 2,
    "3–6 months": 5,
    "6–12 months": 7,
    "1+ year": 9,
    "I want to build a long-term association": 10,
  };

  const networkSize = networkSizeMap[input.networkSize] ?? 0;
  const networkDiversity = Math.min(10, input.industries.length);
  const salesExperience =
    (input.soldBefore === "Yes" ? 10 : 0) +
    (input.soldBefore === "Yes" && input.salesExperience.trim().length > 0
      ? 5
      : 0);
  const comfort = Math.min(
    15,
    (clampScale(input.comfortApproach) +
      clampScale(input.comfortColdCall) +
      clampScale(input.comfortOutreach))
  );
  const commitmentHours = hoursMap[input.weeklyHours] ?? 0;
  const longTermIntent = durationMap[input.duration] ?? 0;
  const interestsBreadth = Math.min(
    5,
    Math.round((Math.min(3, input.interests.length) / 3) * 5)
  );
  const avgChars =
    (input.about.trim().length +
      input.whySelect.trim().length +
      input.websiteObjection.trim().length +
      input.rejectionResponse.trim().length) /
    4;
  const paragraphDepth = Math.min(15, Math.round((avgChars / 100) * 15 * 10) / 10);

  const breakdown: EGAScoreBreakdown = {
    networkSize,
    networkDiversity,
    salesExperience,
    comfort,
    commitmentHours,
    longTermIntent,
    interestsBreadth,
    paragraphDepth,
  };

  const score = Math.round(
    Object.values(breakdown).reduce((sum, n) => sum + n, 0)
  );

  return { score: Math.min(100, score), breakdown };
}

function clampScale(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(5, Math.max(1, n));
}

export const SCORE_BREAKDOWN_LABELS: Record<keyof EGAScoreBreakdown, string> = {
  networkSize: "Network size",
  networkDiversity: "Network diversity",
  salesExperience: "Sales experience",
  comfort: "Comfort scores",
  commitmentHours: "Weekly commitment",
  longTermIntent: "Long-term intent",
  interestsBreadth: "Interests breadth",
  paragraphDepth: "Answer depth",
};

export const SCORE_BREAKDOWN_MAX: Record<keyof EGAScoreBreakdown, number> = {
  networkSize: 20,
  networkDiversity: 10,
  salesExperience: 15,
  comfort: 15,
  commitmentHours: 10,
  longTermIntent: 10,
  interestsBreadth: 5,
  paragraphDepth: 15,
};
