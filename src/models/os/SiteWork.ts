import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES } from "@/lib/os/constants";

const siteWorkSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    location: { type: String, default: "" },
    category: { type: String, default: "" },
    fullWidth: { type: Boolean, default: false },
    problem: { type: String, default: "" },
    approach: { type: String, default: "" },
    outcome: { type: String, default: "" },
    focus: { type: [String], default: [] },
    sortOrder: { type: Number, default: 0 },
    /** External URL or static path like /works/foo.png */
    imageUrl: { type: String, default: "" },
    imageBase64: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    recordStatus: {
      type: String,
      enum: RECORD_STATUSES,
      default: "active",
    },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

siteWorkSchema.index({ recordStatus: 1, sortOrder: 1 });

export type SiteWorkDoc = InferSchemaType<typeof siteWorkSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const SiteWork = models.SiteWork || model("SiteWork", siteWorkSchema);
