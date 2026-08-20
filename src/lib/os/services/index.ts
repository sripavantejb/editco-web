export { validateLeadStageChange, type LeadStageChangeInput } from "./lead-service";
export { calculateMilestoneProgress } from "./milestone-service";
export { buildLeadListQuery } from "./lead-list-service";
export { findConversionDuplicates, type DuplicateMatch } from "./company-service";
export {
  validateProjectStatusChange,
  migrateLegacyProjectStatuses,
  syncProjectProgressFromMilestones,
  type ProjectStatusChangeInput,
} from "./project-service";
export {
  getVaultProjectAnalytics,
  getVaultProjectsComparison,
  type VaultProjectAnalytics,
  type VaultComparisonRow,
} from "./vault-analytics";
