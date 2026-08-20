import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const activityEventSchema = new Schema(
  {
    conversionUuid: { type: String, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "OsLead" },
    vendorId: { type: Schema.Types.ObjectId, ref: "OsVendor" },
    projectId: { type: Schema.Types.ObjectId, ref: "OsProject", index: true },
    entityType: { type: String, required: true },
    entityId: { type: String, default: "" },
    title: { type: String, required: true },
    detail: { type: String, default: "" },
    createdBy: { type: String, default: "" },
    actorUserId: { type: Schema.Types.ObjectId, ref: "StaffUser", index: true },
    actionType: { type: String, default: "", index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activityEventSchema.index({ createdAt: -1 });

export type ActivityEventDoc = InferSchemaType<typeof activityEventSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
};

export const ActivityEvent =
  models.ActivityEvent || model("ActivityEvent", activityEventSchema);
