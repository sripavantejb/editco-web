import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const salesNotificationSchema = new Schema(
  {
    recipientEmployeeId: { type: Schema.Types.ObjectId, ref: "SalesEmployee", required: true, index: true },
    type: { type: String, trim: true, default: "" },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: "" },
    href: { type: String, default: "" },
    readAt: { type: Date },
  },
  { timestamps: true }
);

salesNotificationSchema.index({ recipientEmployeeId: 1, createdAt: -1 });

export type SalesNotificationDoc = InferSchemaType<typeof salesNotificationSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesNotification = models.SalesNotification || model("SalesNotification", salesNotificationSchema);
