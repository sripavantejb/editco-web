import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import type { ApplicationStatus, FormFieldType } from "@/lib/constants";
import type { AnswerValue } from "@/lib/jobs";

const answerSchema = new Schema(
  {
    fieldId: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "short_text",
        "long_text",
        "email",
        "phone",
        "number",
        "url",
        "date",
        "select",
        "radio",
        "checkbox",
        "multi_checkbox",
        "file",
      ],
      required: true,
    },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const jobApplicationSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    jobTitle: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "reviewing", "shortlisted", "rejected", "hired"],
      default: "new",
      index: true,
    },
    applicantName: { type: String, required: true, trim: true },
    applicantEmail: { type: String, lowercase: true, trim: true, index: true },
    answers: { type: [answerSchema], default: [] },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

export type JobApplicationAnswerDoc = {
  fieldId: string;
  label: string;
  type: FormFieldType;
  value: AnswerValue;
};

export type JobApplicationDoc = InferSchemaType<typeof jobApplicationSchema> & {
  _id: Types.ObjectId;
  status: ApplicationStatus;
  answers: JobApplicationAnswerDoc[];
  createdAt: Date;
  updatedAt: Date;
};

export const JobApplication =
  models.JobApplication || model("JobApplication", jobApplicationSchema);
