export const LEAD_CSV_HEADERS = [
  "name",
  "company",
  "phone",
  "email",
  "source",
  "industry",
  "sector",
  "interestedServices",
  "requirement",
  "estimatedValue",
  "assignedOwner",
  "status",
  "priority",
  "notes",
] as const;

export const LEAD_CSV_TEMPLATE = [
  LEAD_CSV_HEADERS.join(","),
  [
    "Jane Doe",
    "Acme Corp",
    "9876543210",
    "jane@acme.com",
    "cold",
    "Technology",
    "IT",
    "website;seo",
    "Need a new site",
    "50000",
    "",
    "new",
    "medium",
    "Imported example",
  ]
    .map((v) =>
      v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v
    )
    .join(","),
  "",
].join("\n");
