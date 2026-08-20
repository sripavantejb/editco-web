import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const projectMemberSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "OsProject",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "StaffUser",
      required: true,
      index: true,
    },
    roleOnProject: {
      type: String,
      enum: ["member", "poc"],
      default: "member",
    },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

projectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export type ProjectMemberDoc = InferSchemaType<typeof projectMemberSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const ProjectMember =
  models.OsProjectMember || model("OsProjectMember", projectMemberSchema);
