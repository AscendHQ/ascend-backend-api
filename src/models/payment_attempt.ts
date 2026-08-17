import { model, Schema } from "mongoose";

const paymentAttemptSchema = new Schema(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      required: true,
      index: true,
    },
    invoice: { type: Schema.Types.ObjectId, ref: "invoice", required: true },
    student: { type: Schema.Types.ObjectId, ref: "student", required: true },
    reference: { type: String, required: true, unique: true },
    amount: { type: Number, required: true, min: 0.01 },
    email: { type: String, required: true, trim: true, lowercase: true },
    status: {
      type: String,
      enum: ["pending", "successful", "failed", "needs_review"],
      default: "pending",
    },
    authorization_url: { type: String },
    access_code: { type: String },
    gateway_response: { type: Schema.Types.Mixed },
    failure_reason: { type: String },
  },
  { timestamps: true },
);

paymentAttemptSchema.index({ invoice: 1, createdAt: -1 });

const PaymentAttemptModel = model("payment_attempt", paymentAttemptSchema);
export default PaymentAttemptModel;
