import { model, Schema } from "mongoose";

import { EInvoiceStatus, IInvoiceDocument } from "../interface";

const invoiceItemSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
  },
  { _id: false },
);

const invoiceSchema = new Schema(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      required: true,
      index: true,
    },
    fee_structure: {
      type: Schema.Types.ObjectId,
      ref: "fee_structure",
      required: true,
    },
    student: { type: Schema.Types.ObjectId, ref: "student", required: true },
    class: { type: Schema.Types.ObjectId, ref: "class", required: true },
    session: { type: String, required: true },
    term: { type: String, required: true },
    invoice_number: { type: String, required: true },
    items: { type: [invoiceItemSchema], required: true },
    total_amount: { type: Number, required: true, min: 0.01 },
    amount_paid: { type: Number, required: true, default: 0, min: 0 },
    status: {
      type: String,
      enum: Object.values(EInvoiceStatus),
      default: EInvoiceStatus.UNPAID,
    },
    due_date: { type: Date, required: true },
  },
  { timestamps: true },
);

invoiceSchema.index({ organization: 1, invoice_number: 1 }, { unique: true });
invoiceSchema.index(
  { organization: 1, student: 1, fee_structure: 1 },
  { unique: true },
);

const InvoiceModel = model<IInvoiceDocument>("invoice", invoiceSchema);
export default InvoiceModel;
