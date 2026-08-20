export const dynamic = "force-dynamic";

import { requireLegacyPage } from "@/lib/os/page";
import { JobApplication } from "@/models/JobApplication";
import {
  ApplicationsTracker,
  type ApplicationsTrackerItem,
} from "@/components/careers/admin/ApplicationsTracker";
import type { ApplicationStatus } from "@/lib/constants";

export default async function AdminApplicationsPage() {
  await requireLegacyPage();
  const apps = await JobApplication.find()
    .sort({ createdAt: -1 })
    .select(
      "jobId jobTitle applicantName applicantEmail status createdAt"
    )
    .lean();

  const items: ApplicationsTrackerItem[] = apps.map((a) => ({
    id: String(a._id),
    jobId: String(a.jobId),
    jobTitle: a.jobTitle,
    applicantName: a.applicantName,
    applicantEmail: a.applicantEmail || "",
    status: a.status as ApplicationStatus,
    createdAt:
      a.createdAt instanceof Date
        ? a.createdAt.toISOString()
        : String(a.createdAt),
  }));

  const stats = {
    total: items.length,
    newCount: items.filter((a) => a.status === "new").length,
    reviewing: items.filter((a) => a.status === "reviewing").length,
    shortlisted: items.filter((a) => a.status === "shortlisted").length,
  };

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
      <ApplicationsTracker applications={items} stats={stats} />
    </main>
  );
}
