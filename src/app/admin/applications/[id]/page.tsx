export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { JobApplication } from "@/models/JobApplication";
import {
  ApplicationDetail,
  type ApplicationDetailData,
} from "@/components/careers/admin/ApplicationDetail";
import { isFileAnswer, type AnswerValue } from "@/lib/jobs";
import type { ApplicationStatus, FormFieldType } from "@/lib/constants";

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  await connectDB();
  const app = await JobApplication.findById(id).lean();
  if (!app) notFound();

  const answers: ApplicationDetailData["answers"] = (
    (app.answers || []) as {
      fieldId: string;
      label: string;
      type: FormFieldType;
      value: AnswerValue;
    }[]
  ).map((a) => {
      let value: AnswerValue = a.value;
      if (isFileAnswer(value)) {
        value = {
          name: value.name,
          mimeType: value.mimeType,
          size: value.size,
          dataBase64: "",
        };
      }
      return {
        fieldId: a.fieldId,
        label: a.label,
        type: a.type,
        value,
      };
    });

  const data: ApplicationDetailData = {
    id: String(app._id),
    jobId: String(app.jobId),
    jobTitle: app.jobTitle,
    applicantName: app.applicantName,
    applicantEmail: app.applicantEmail || "",
    status: app.status as ApplicationStatus,
    adminNotes: app.adminNotes || "",
    createdAt:
      app.createdAt instanceof Date
        ? app.createdAt.toISOString()
        : String(app.createdAt),
    answers,
  };

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
      <ApplicationDetail app={data} />
    </main>
  );
}
