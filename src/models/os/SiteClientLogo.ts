import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES } from "@/lib/os/constants";

const siteClientLogoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    href: { type: String, default: "" },
    alt: { type: String, default: "" },
    card: { type: String, enum: ["light", "dark", ""], default: "light" },
    scale: { type: Number, default: 1.2 },
    sortOrder: { type: Number, default: 0 },
    /** External URL or static path like /clients/foo.png */
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

siteClientLogoSchema.index({ recordStatus: 1, sortOrder: 1 });

export type SiteClientLogoDoc = InferSchemaType<typeof siteClientLogoSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const SiteClientLogo =
  models.SiteClientLogo || model("SiteClientLogo", siteClientLogoSchema);
