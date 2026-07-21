import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import type { Stage } from "@/lib/constants";

const referralSchema = new Schema(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: "Referrer",
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["manual_submission", "link_click"],
      required: true,
    },
    referredName: { type: String, required: true, trim: true },
    referredBusiness: { type: String, trim: true },
    referredEmail: { type: String, lowercase: true, trim: true, index: true },
    referredPhone: { type: String, trim: true, index: true },
    referredNeeds: { type: String },
    referrerNotes: { type: String },
    consentToIntroEmail: { type: Boolean, default: false },
    mentionReferrerName: { type: Boolean, default: false },
    stage: {
      type: String,
      enum: [
        "submitted",
        "contacted",
        "qualified_call",
        "proposal_sent",
        "won",
        "lost",
      ],
      default: "submitted",
      index: true,
    },
    lostReason: { type: String },
    projectType: {
      type: String,
      enum: ["website", "website_crm", "ai_growth"],
    },
    projectValue: { type: Number },
    rewardAmount: { type: Number },
    rewardStatus: {
      type: String,
      enum: ["not_applicable", "pending", "paid"],
      default: "not_applicable",
    },
    flaggedDuplicate: { type: Boolean, default: false },
    adminInternalNotes: { type: String },
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    landingPage: { type: String },
    firstClickAt: { type: Date },
    convertedAt: { type: Date },
  },
  { timestamps: true }
);

export type ReferralDoc = InferSchemaType<typeof referralSchema> & {
  _id: Types.ObjectId;
  stage: Stage;
  createdAt: Date;
  updatedAt: Date;
};

export const Referral =
  models.Referral || model("Referral", referralSchema);
