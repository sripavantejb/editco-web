export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { JobDetail } from "@/components/careers/JobDetail";
import type { FormFieldDef } from "@/lib/jobs";
import type { EmploymentType } from "@/lib/constants";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connectDB();
  const job = await Job.findOne({ slug, status: "published" })
    .select("title summary")
    .lean();
  if (!job) return { title: "Role | Editco" };
  return {
    title: `${job.title} | Careers | Editco`,
    description: job.summary || `Apply for ${job.title} at Editco.`,
  };
}

export default async function CareerJobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connectDB();
  const job = await Job.findOne({ slug, status: "published" }).lean();
  if (!job) notFound();

  return (
    <JobDetail
      job={{
        id: String(job._id),
        title: job.title,
        department: job.department || "",
        location: job.location || "Remote",
        employmentType: job.employmentType as EmploymentType,
        summary: job.summary || "",
        description: job.description || "",
        requirements: job.requirements || "",
        benefits: job.benefits || "",
        formFields: (job.formFields || []) as FormFieldDef[],
      }}
    />
  );
}
