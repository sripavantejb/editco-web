export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireLegacyPage } from "@/lib/os/page";
import { Job } from "@/models/Job";
import { JobApplication } from "@/models/JobApplication";
import {
  ApplicationsList,
  type ApplicationsListItem,
} from "@/components/careers/admin/ApplicationsList";
import type { ApplicationStatus } from "@/lib/constants";

export default async function AdminJobApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireLegacyPage();

  const { id } = await params;
  const job = await Job.findById(id).lean();
  if (!job) notFound();

  const apps = await JobApplication.find({ jobId: job._id })
    .sort({ createdAt: -1 })
    .select("applicantName applicantEmail status createdAt")
    .lean();

  const items: ApplicationsListItem[] = apps.map((a) => ({
    id: String(a._id),
    applicantName: a.applicantName,
    applicantEmail: a.applicantEmail || "",
    status: a.status as ApplicationStatus,
    createdAt:
      a.createdAt instanceof Date
        ? a.createdAt.toISOString()
        : String(a.createdAt),
  }));

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
      <ApplicationsList
        jobId={String(job._id)}
        jobTitle={job.title}
        applications={items}
      />
    </main>
  );
}
