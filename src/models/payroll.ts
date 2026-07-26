import { model, Schema } from "mongoose";
import {
  EBreakdownType,
  EPayrollStatus,
  IPayroll,
  IPayrollDocument,
} from "../interface";

const breakdownItemSchema = new Schema(
  {
    label: { type: String, required: true },
    amount: { type: Number, required: true, default: 0 },
    type: { type: String, enum: Object.values(EBreakdownType), required: true },
  },
  { _id: false }
);

const payrollSchemaFields: Record<keyof IPayroll, any> = {
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organization",
    required: true,
  },
  staff: {
    type: Schema.Types.ObjectId,
    ref: "staff",
    required: true,
  },
  staff_no: { type: String, required: true },
  staff_name: { type: String, required: true },
  job_title: { type: String },
  bank_name: { type: String },
  account_number: { type: String },
  academic_year: { type: String, required: true },
  month: { type: String, required: true },
  basic_salary: { type: Number, required: true, default: 0 },
  breakdown: { type: [breakdownItemSchema], default: [] },
  total_allowances: { type: Number, default: 0 },
  total_deductions: { type: Number, default: 0 },
  net_pay: { type: Number, default: 0 },
  status: {
    type: String,
    enum: Object.values(EPayrollStatus),
    default: EPayrollStatus.GENERATED,
  },
  date_deleted: { type: Date },
};

const payrollSchema = new Schema(payrollSchemaFields, {
  timestamps: true,
});

// A staff member should only have one payroll record per academic year + month
payrollSchema.index(
  { organization: 1, staff: 1, academic_year: 1, month: 1 },
  { unique: true }
);

const PayrollModel = model<IPayrollDocument>("payroll", payrollSchema);
export default PayrollModel;
