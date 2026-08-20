import type { LeadListFilters } from "@/models/os/LeadList";

/** Build a MongoDB query from saved list filters — never copies leads. */
export function buildLeadListQuery(
  filters: LeadListFilters
): Record<string, unknown> {
  const query: Record<string, unknown> = { recordStatus: "active" };

  if (filters.status?.length) {
    query.status = { $in: filters.status };
  } else if (filters.excludeStatuses?.length) {
    query.status = { $nin: filters.excludeStatuses };
  }
  if (filters.source?.length) {
    query.source = { $in: filters.source };
  }
  if (filters.priority?.length) {
    query.priority = { $in: filters.priority };
  }
  if (filters.industry?.trim()) {
    query.industry = { $regex: filters.industry.trim(), $options: "i" };
  }
  if (filters.assignedOwner?.trim()) {
    query.assignedOwner = filters.assignedOwner.trim();
  }

  return query;
}
