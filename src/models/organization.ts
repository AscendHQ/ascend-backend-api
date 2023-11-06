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
  slug: { type: String },
  last_staff_id: { type: String },
  last_student_id: { type: String },
};

const organizationSchema = new Schema(organizationSchemaFields, {
  timestamps: true,
});

const OrganizationModel = model<IOrganizationDocument>(
  "organization",
  organizationSchema
);
export default OrganizationModel;
