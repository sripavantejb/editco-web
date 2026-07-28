import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import type { EmploymentType, JobStatus } from "@/lib/constants";
import type { FormFieldDef } from "@/lib/jobs";

const formFieldOptionSchema = new Schema(
  {
    value: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

const formFieldSchema = new Schema(
  {
    id: { type: String, required: true },
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
    label: { type: String, required: true, trim: true },
    placeholder: { type: String },
    helpText: { type: String },
    required: { type: Boolean, default: false },
    options: { type: [formFieldOptionSchema], default: undefined },
    accept: { type: String },
    maxSizeMb: { type: Number },
  },
  { _id: false }
);

const jobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    department: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "Remote" },
    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "contract", "internship", "freelance"],
      default: "full_time",
    },
    summary: { type: String, trim: true, default: "" },
    description: { type: String, default: "" },
    requirements: { type: String, default: "" },
    benefits: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
      index: true,
    },
    formFields: { type: [formFieldSchema], default: [] },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

export type JobDoc = InferSchemaType<typeof jobSchema> & {
  _id: Types.ObjectId;
  employmentType: EmploymentType;
  status: JobStatus;
  formFields: FormFieldDef[];
  createdAt: Date;
  updatedAt: Date;
};

export const Job = models.Job || model("Job", jobSchema);
