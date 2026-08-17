import { model, Schema } from "mongoose";

import { EPaymentMethod, IPaymentDocument } from "../interface";

const paymentSchema = new Schema(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      required: true,
      index: true,
    },
    invoice: { type: Schema.Types.ObjectId, ref: "invoice", required: true },
    student: { type: Schema.Types.ObjectId, ref: "student", required: true },
    amount: { type: Number, required: true, min: 0.01 },
    method: {
      type: String,
      enum: Object.values(EPaymentMethod),
      required: true,
    },
    reference: { type: String, required: true, trim: true },
    receipt_number: { type: String, required: true },
    note: { type: String, trim: true, maxlength: 250 },
    paid_at: { type: Date, required: true, default: Date.now },
    recorded_by: { type: Schema.Types.ObjectId, ref: "account" },
  },
  { timestamps: true },
);

paymentSchema.index({ organization: 1, reference: 1 }, { unique: true });
paymentSchema.index({ organization: 1, receipt_number: 1 }, { unique: true });

const PaymentModel = model<IPaymentDocument>("payment", paymentSchema);
export default PaymentModel;
