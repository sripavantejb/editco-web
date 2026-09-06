import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES } from "@/lib/os/constants";

const siteCrewMemberSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "" },
    description: { type: String, default: "" },
    accent: {
      type: String,
      enum: ["orange", "green", "purple"],
      default: "orange",
    },
    linkedin: { type: String, default: "" },
    portfolio: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
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

siteCrewMemberSchema.index({ recordStatus: 1, sortOrder: 1 });

export type SiteCrewMemberDoc = InferSchemaType<typeof siteCrewMemberSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const SiteCrewMember =
  models.SiteCrewMember || model("SiteCrewMember", siteCrewMemberSchema);
