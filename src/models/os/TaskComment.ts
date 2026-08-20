import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const commentSchema = new Schema(
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
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export type TaskCommentDoc = InferSchemaType<typeof commentSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const TaskComment =
  models.OsTaskComment || model("OsTaskComment", commentSchema);
