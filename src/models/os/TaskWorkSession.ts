import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const workSessionSchema = new Schema(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "OsTask",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "StaffUser",
      required: true,
      index: true,
    },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    durationMs: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type TaskWorkSessionDoc = InferSchemaType<typeof workSessionSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
};

export const TaskWorkSession =
  models.OsTaskWorkSession || model("OsTaskWorkSession", workSessionSchema);
