import { model, Schema } from "mongoose";
import {
  EDenomination,
  EEmploymentType,
  EGender,
  EStaffStatus,
  IStaff,
  IStaffDocument,
} from "../interface";

const staffSchemaFields: Record<keyof IStaff, any> = {
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organization",
    required: true,
  },
  staff_no: { type: String, required: true, unique: true },
  surname: { type: String, required: true },
  other_names: { type: String, required: true },
  sex: { type: String, enum: Object.values(EGender) },
  status: { type: String, enum: Object.values(EStaffStatus) },
  type: { type: String, enum: Object.values(EEmploymentType) },
  denomination: { type: String, enum: Object.values(EDenomination) },
  department: { type: String },
  qualifications: [{ type: String }],
  post: { type: String },
  address: { type: String },
  phone_number: { type: String },
  loan_received: { type: Number, default: 0 },
  loan_refunded: { type: Number, default: 0 },
  loan_debt: { type: Number, default: 0 },
  employment_date: { type: Date },
  exit_date: { type: Date },
  date_deleted: { type: Date },
  exit_reason: { type: String },
};

const staffSchema = new Schema(staffSchemaFields, {
  timestamps: true,
});

const StaffModel = model<IStaffDocument>("staff", staffSchema);
export default StaffModel;
