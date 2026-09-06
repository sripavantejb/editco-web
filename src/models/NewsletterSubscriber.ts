import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const newsletterSubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, default: "footer" },
    agreed: { type: Boolean, default: false },
    recordStatus: {
      type: String,
      enum: ["active", "archived", "unsubscribed"],
      default: "active",
    },
  },
  { timestamps: true }
);

newsletterSubscriberSchema.index({ email: 1 });

export type NewsletterSubscriberDoc = InferSchemaType<
  typeof newsletterSubscriberSchema
> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const NewsletterSubscriber =
  models.NewsletterSubscriber ||
  model("NewsletterSubscriber", newsletterSubscriberSchema);
