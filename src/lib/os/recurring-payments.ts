/** Client-safe constants for recurring payments (no mongoose). */

export const RECURRING_PAYMENT_FREQUENCIES = [
  "weekly",
  "monthly",
  "quarterly",
  "yearly",
] as const;
export type RecurringPaymentFrequency =
  (typeof RECURRING_PAYMENT_FREQUENCIES)[number];

export const RECURRING_PAYMENT_FREQUENCY_LABELS: Record<
  RecurringPaymentFrequency,
  string
> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export const RECURRING_PAYMENT_STATUSES = ["active", "paused", "ended"] as const;
export type RecurringPaymentStatus =
  (typeof RECURRING_PAYMENT_STATUSES)[number];
