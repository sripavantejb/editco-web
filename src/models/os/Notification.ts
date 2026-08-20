import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const notificationSchema = new Schema(
  {
    recipientEmail: { type: String, lowercase: true, index: true },
    recipientRole: { type: String },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    href: { type: String, default: "" },
    conversionUuid: { type: String },
    readAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ recipientEmail: 1, readAt: 1 });

export type NotificationDoc = InferSchemaType<typeof notificationSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
};

export const OsNotification =
  models.OsNotification || model("OsNotification", notificationSchema);
