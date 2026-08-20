export function slugifyVaultName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function isValidHttpUrl(value: string): boolean {
  if (!value.trim()) return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export type MessageVars = {
  name?: string;
  company?: string;
  project_name?: string;
  sender_name?: string;
  phone?: string;
  website?: string;
};

/** Replace {{var}} placeholders; missing values become empty string (never "undefined"). */
export function renderMessageTemplate(
  template: string,
  vars: MessageVars
): string {
  const map: Record<string, string> = {
    name: vars.name?.trim() || "",
    company: vars.company?.trim() || "",
    project_name: vars.project_name?.trim() || "",
    sender_name: vars.sender_name?.trim() || "",
    phone: vars.phone?.trim() || "",
    website: vars.website?.trim() || "",
  };
  return template.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_m, key: string) => {
    const k = key.toLowerCase();
    return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : "";
  });
}
