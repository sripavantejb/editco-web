export const dynamic = "force-dynamic";

import { requireLegacyPage } from "@/lib/os/page";
import { Job } from "@/models/Job";
import { JobApplication } from "@/models/JobApplication";
import { JobsList, type JobsListItem } from "@/components/careers/admin/JobsList";
import type { EmploymentType, JobStatus } from "@/lib/constants";

export default async function AdminJobsPage() {
  await requireLegacyPage();
  const jobs = await Job.find().sort({ updatedAt: -1 }).lean();
  const counts = await JobApplication.aggregate<{
    _id: unknown;
    count: number;
  }>([{ $group: { _id: "$jobId", count: { $sum: 1 } } }]);

  const countMap = Object.fromEntries(
    counts.map((c) => [String(c._id), c.count])
  );

  const items: JobsListItem[] = jobs.map((j) => ({
    id: String(j._id),
    title: j.title,
    department: j.department || "",
    location: j.location || "",
    employmentType: j.employmentType as EmploymentType,
    status: j.status as JobStatus,
    applicationCount: countMap[String(j._id)] || 0,
    updatedAt:
      j.updatedAt instanceof Date
        ? j.updatedAt.toISOString()
        : String(j.updatedAt),
  }));

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
      <JobsList jobs={items} />
    </main>
  );
}
