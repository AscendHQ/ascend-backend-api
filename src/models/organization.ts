import { model, Schema } from "mongoose";
import { IOrganization, IOrganizationDocument } from "../interface";

const organizationSchemaFields: Record<keyof IOrganization, any> = {
  name: { type: String, required: true },
  description: { type: String },
  organization_logo: {
    path: { type: String },
    filename: { type: String },
    key: { type: String },
  },
  address: {
    street: { type: String },
    zip_code: { type: String },
    country: { type: String },
  },
  is_verified: { type: Boolean },
  is_active: { type: Boolean, default: true },
  suspended_at: { type: Date },
  suspended_by: { type: Schema.Types.ObjectId, ref: "account" },
  suspension_reason: { type: String, trim: true, maxlength: 500 },
  slug: { type: String },
  last_staff_id: { type: String },
  last_student_id: { type: String },
  academic_settings: {
    current_session: { type: String },
    current_term: {
      type: String,
      enum: ["1st Term", "2nd Term", "3rd Term"],
    },
    term_length_weeks: { type: Number, min: 1, max: 30, default: 13 },
    pass_mark: { type: Number, min: 0, max: 100, default: 50 },
  },
  academic_period_history: [
    {
      session: { type: String, required: true },
      term: { type: String, required: true },
      closed_at: { type: Date, default: Date.now },
      closed_by: { type: Schema.Types.ObjectId, ref: "account" },
    },
  ],
};

const organizationSchema = new Schema(organizationSchemaFields, {
  timestamps: true,
});

const OrganizationModel = model<IOrganizationDocument>(
  "organization",
  organizationSchema,
);
export default OrganizationModel;
