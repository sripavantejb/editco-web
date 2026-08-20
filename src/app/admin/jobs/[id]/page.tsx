export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireLegacyPage } from "@/lib/os/page";
import { Job } from "@/models/Job";
import { JobApplication } from "@/models/JobApplication";
import { JobEditor } from "@/components/careers/admin/JobEditor";
import type { FormFieldDef } from "@/lib/jobs";
import type { EmploymentType, JobStatus } from "@/lib/constants";

export default async function AdminEditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireLegacyPage();

  const { id } = await params;
  const job = await Job.findById(id).lean();
  if (!job) notFound();

  const applicationCount = await JobApplication.countDocuments({
    jobId: job._id,
  });

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
      <JobEditor
        job={{
          id: String(job._id),
          title: job.title,
          department: job.department || "",
          location: job.location || "",
          employmentType: job.employmentType as EmploymentType,
          summary: job.summary || "",
          description: job.description || "",
          requirements: job.requirements || "",
          benefits: job.benefits || "",
          status: job.status as JobStatus,
          formFields: (job.formFields || []) as FormFieldDef[],
          applicationCount,
        }}
      />
    </main>
  );
}
