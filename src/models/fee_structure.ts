import { model, Schema } from "mongoose";

import { IFeeStructureDocument } from "../interface";

const feeItemSchema = new Schema(
  {
    label: { type: String, required: true, trim: true, maxlength: 100 },
    amount: { type: Number, required: true, min: 0.01 },
  },
  { _id: false },
);

const feeStructureSchema = new Schema(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    class: { type: Schema.Types.ObjectId, ref: "class", required: true },
    session: { type: String, required: true },
    term: { type: String, required: true },
    items: { type: [feeItemSchema], required: true },
    total_amount: { type: Number, required: true, min: 0.01 },
    due_date: { type: Date, required: true },
    is_active: { type: Boolean, default: true },
    created_by: { type: Schema.Types.ObjectId, ref: "account" },
  },
  { timestamps: true },
);

feeStructureSchema.index(
  { organization: 1, class: 1, session: 1, term: 1, name: 1 },
  { unique: true },
);

const FeeStructureModel = model<IFeeStructureDocument>(
  "fee_structure",
  feeStructureSchema,
);

export default FeeStructureModel;
