export function str(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export function num(formData: FormData, key: string) {
  const n = Number(formData.get(key));
  return Number.isFinite(n) ? n : 0;
}

export function optDate(formData: FormData, key: string) {
  const raw = str(formData, key);
  if (!raw) return undefined;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function csv(formData: FormData, key: string) {
  return str(formData, key)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function bool(formData: FormData, key: string) {
  const v = formData.get(key);
  return v === "on" || v === "true" || v === "1";
}

export async function nextInvoiceNumber() {
  const { Invoice } = await import("@/models/os/Invoice");
  const year = new Date().getFullYear();
  const prefix = `EC-INV-${year}-`;
  const last = await Invoice.find({ invoiceNumber: new RegExp(`^${prefix}`) })
    .sort({ invoiceNumber: -1 })
    .limit(1)
    .lean();
  const current = last[0]?.invoiceNumber?.split("-").pop() || "000";
  const next = String(Number(current) + 1).padStart(3, "0");
  return `${prefix}${next}`;
}
