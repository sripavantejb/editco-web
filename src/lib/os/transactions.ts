/** Client-safe constants for the company transactions ledger (no mongoose). */

export const TRANSACTION_TYPES = ["income", "expense"] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  income: "Income",
  expense: "Spent",
};

export const TRANSACTION_CATEGORIES: Record<TransactionType, readonly string[]> = {
  income: [
    "Client payment",
    "Retainer",
    "Advance",
    "Investment",
    "Refund received",
    "Other income",
  ],
  expense: [
    "Salaries",
    "Freelancers",
    "Software & tools",
    "Ads & marketing",
    "Rent & office",
    "Equipment",
    "Travel",
    "Food",
    "Taxes & fees",
    "Other expense",
  ],
};

export const TRANSACTION_PAYMENT_METHODS = [
  "upi",
  "bank_transfer",
  "cash",
  "card",
  "cheque",
  "other",
] as const;
export type TransactionPaymentMethod = (typeof TRANSACTION_PAYMENT_METHODS)[number];

export const TRANSACTION_PAYMENT_METHOD_LABELS: Record<TransactionPaymentMethod, string> = {
  upi: "UPI",
  bank_transfer: "Bank transfer",
  cash: "Cash",
  card: "Card",
  cheque: "Cheque",
  other: "Other",
};

export const TRANSACTION_HISTORY_ACTIONS = ["created", "updated", "deleted"] as const;
export type TransactionHistoryAction = (typeof TRANSACTION_HISTORY_ACTIONS)[number];

/** Every add / edit / delete in the ledger is mailed to these inboxes. */
export const TRANSACTION_ALERT_EMAILS = [
  "sripavantejb@gmail.com",
  "editcomedia@gmail.com",
] as const;
