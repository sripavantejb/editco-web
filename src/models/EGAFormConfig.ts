import { Schema, models, model } from "mongoose";
import type { EGAFormConfigData, EGAQuestion } from "@/lib/ega-form";

const questionSchema = new Schema(
  {
    name: { type: String, required: true },
    section: { type: Number, required: true, min: 1, max: 5 },
    type: { type: String, required: true },
    label: { type: String, required: true },
    helpText: { type: String, default: "" },
    placeholder: { type: String, default: "" },
    required: { type: Boolean, default: false },
    options: { type: [String], default: undefined },
    max: { type: Number },
    scaleLow: { type: String },
    scaleHigh: { type: String },
  },
  { _id: false }
);

const copySchema = new Schema(
  {
    introKicker: { type: String, default: "" },
    introTitle: { type: String, default: "" },
    introMinutes: { type: String, default: "" },
    introBody: { type: String, default: "" },
    introBullets: { type: [String], default: [] },
    sectionTitles: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false }
);

const egaFormConfigSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "default" },
    copy: { type: copySchema, default: {} },
    questions: { type: [questionSchema], default: [] },
  },
  { timestamps: true }
);

export const EGAFormConfig =
  models.EGAFormConfig || model("EGAFormConfig", egaFormConfigSchema);

export type EGAFormConfigDoc = {
  key: string;
  copy: EGAFormConfigData["copy"];
  questions: EGAQuestion[];
};
