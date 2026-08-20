import {
  Schema,
  models,
  model,
  type InferSchemaType,
  Types,
  type Model,
} from "mongoose";
import { STAFF_ROLES, type StaffRole } from "@/lib/os/constants";

const staffUserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, trim: true, default: "" },
    passwordHash: { type: String, default: "" },
    role: {
      type: String,
      enum: [...STAFF_ROLES],
      default: "sales",
    },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export type StaffUserDoc = InferSchemaType<typeof staffUserSchema> & {
  _id: Types.ObjectId;
  role: StaffRole;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Next.js HMR reuses `models.StaffUser` with a stale schema compiled before
 * newer roles (e.g. team_member) existed. Sync the enum on every load.
 */
function syncRoleEnum(m: Model<StaffUserDoc>) {
  const path = m.schema.path("role") as {
    enumValues?: string[];
    options?: { enum?: readonly string[] | string[] };
  } | null;
  if (!path) return;
  const values = [...STAFF_ROLES];
  path.enumValues = values;
  if (path.options) path.options.enum = values;
}

export const StaffUser: Model<StaffUserDoc> = (models.StaffUser
  ? (models.StaffUser as Model<StaffUserDoc>)
  : model<StaffUserDoc>("StaffUser", staffUserSchema));

syncRoleEnum(StaffUser);
