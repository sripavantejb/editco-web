export const dynamic = "force-dynamic";

import { connectDB } from "@/lib/db";
import { Job } from "@/models/Job";
import { CareersLanding } from "@/components/careers/CareersLanding";
import type { PublicJobCard } from "@/components/careers/JobCard";
import type { EmploymentType } from "@/lib/constants";

export const metadata = {
  title: "Careers | Editco",
  description: "Open roles at Editco Media.",
};

export default async function CareersPage() {
  let cards: PublicJobCard[] = [];
  try {
    await connectDB();
    const jobs = await Job.find({ status: "published" })
      .sort({ publishedAt: -1, updatedAt: -1 })
      .lean();

    cards = jobs.map((j) => ({
      id: String(j._id),
      slug: j.slug,
      title: j.title,
      department: j.department || "",
      location: j.location || "Remote",
      employmentType: j.employmentType as EmploymentType,
      summary: j.summary || "",
    }));
  } catch {
    cards = [];
  }

  return <CareersLanding jobs={cards} />;
}
