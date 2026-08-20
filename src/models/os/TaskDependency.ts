import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const dependencySchema = new Schema(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "OsTask",
      required: true,
      index: true,
    },
    dependsOnTaskId: {
      type: Schema.Types.ObjectId,
      ref: "OsTask",
      required: true,
      index: true,
    },
    dependencyType: {
      type: String,
      enum: ["blocks"],
      default: "blocks",
    },
    createdBy: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

dependencySchema.index(
  { taskId: 1, dependsOnTaskId: 1 },
  { unique: true }
);

export type TaskDependencyDoc = InferSchemaType<typeof dependencySchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
};

export const TaskDependency =
  models.OsTaskDependency || model("OsTaskDependency", dependencySchema);
