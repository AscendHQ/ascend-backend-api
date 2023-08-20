import { model, Schema } from "mongoose";
import { EGender, IStaff, IStaffDocument } from "../interface";

const staffSchemaFields: Record<keyof IStaff, any> = {
  organization: {
    type: Schema.Types.ObjectId,
    ref: "organization",
    required: true,
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: "account",
  },
  permissions: {
    type: Schema.Types.ObjectId,
    ref: "permission",
  },
  staff_org_id: { type: String, required: true, unique: true },
  bio_data: {
    last_name: { type: String, required: true },
    first_name: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: EGender, default: EGender.FEMALE },
    phone_number: { type: String },
    email: { type: String },
  },
  address: {
    home_address: { type: String },
    state_of_origin: { type: String },
    local_government_area: { type: String },
  },
  next_of_kin: {
    last_name: { type: String, required: true },
    first_name: { type: String, required: true },
    relationship: { type: String, required: true },
    gender: { type: String, enum: EGender },
    email: { type: String },
    phone_number: { type: String },
    address: {
      home_address: { type: String },
      state_of_origin: { type: String },
      local_government_area: { type: String },
    },
  },
  picture: {
    path: { type: String },
    filename: { type: String },
    key: { type: String },
  },
  official_information: {
    job_title: { type: String },
    staff_category: { type: String },
    employment_start_date: { type: Date },
    employment_end_date: { type: Date },
    department: { type: String },
    educational_qualification: { type: String },
  },
  is_active: { type: Boolean, default: false },
};

const staffSchema = new Schema(staffSchemaFields, {
  timestamps: true,
});

const StaffModel = model<IStaffDocument>("staff", staffSchema);
export default StaffModel;
