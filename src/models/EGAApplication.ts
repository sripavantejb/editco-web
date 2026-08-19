import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import type { EGAScoreBreakdown, EGAStatus } from "@/lib/ega";

const egaApplicationSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true },
    college: { type: String, required: true, trim: true },
    yearOfStudy: { type: String, required: true },
    specialization: { type: String, required: true },
    city: { type: String, default: "", trim: true },

    about: { type: String, required: true },
    whyAssociate: { type: String, default: "" },
    interests: { type: [String], default: [] },

    knowsOwners: { type: String, required: true },
    networkSize: { type: String, required: true },
    industries: { type: [String], default: [] },
    networkSources: { type: [String], default: [] },
    businessTypes: { type: String, default: "" },

    soldBefore: { type: String, required: true },
    salesExperience: { type: String, default: "" },
    comfortApproach: { type: Number, required: true },
    comfortColdCall: { type: Number, required: true },
    comfortOutreach: { type: Number, required: true },

    restaurantProblems: { type: String, default: "" },
    websiteObjection: { type: String, required: true },
    expensiveObjection: { type: String, default: "" },
    rejectionResponse: { type: String, required: true },

    services: { type: [String], default: [] },
    exampleBusiness: { type: String, default: "" },

    weeklyHours: { type: String, required: true },
    performanceBased: { type: String, required: true },
    training: { type: String, required: true },
    duration: { type: String, required: true },

    whySelect: { type: String, required: true },
    achievements: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    anythingElse: { type: String, default: "" },

    agreement: { type: [String], default: [] },

    status: {
      type: String,
      enum: ["pending", "selected", "lookback", "rejected", "shortlisted"],
      default: "pending",
      index: true,
    },
    score: { type: Number, default: 0, index: true },
    scoreBreakdown: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

egaApplicationSchema.index({ createdAt: -1 });

export type EGAApplicationDoc = InferSchemaType<typeof egaApplicationSchema> & {
  _id: Types.ObjectId;
  status: EGAStatus;
  scoreBreakdown: EGAScoreBreakdown;
  createdAt: Date;
  updatedAt: Date;
};

if (models.EGAApplication) {
  delete models.EGAApplication;
}

export const EGAApplication = model("EGAApplication", egaApplicationSchema);
