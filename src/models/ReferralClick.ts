import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const referralClickSchema = new Schema(
  {
    referralCode: { type: String, required: true, uppercase: true, index: true },
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    landingPage: { type: String },
    userAgent: { type: String },
    ipHash: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type ReferralClickDoc = InferSchemaType<typeof referralClickSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
};

export const ReferralClick =
  models.ReferralClick || model("ReferralClick", referralClickSchema);
