import { model, Schema } from "mongoose";
import { IOrganization, IOrganizationDocument } from "../interface";

const organizationSchemaFields: Record<keyof IOrganization, any> = {
  name: { type: String },
  description: { type: String },
  organization_logo: {
    path: { type: String },
    filename: { type: String },
  },
  address: {
    street: { type: String },
    zip_code: { type: String },
    country: { type: String },
  },
};

const organizationSchema = new Schema(organizationSchemaFields, {
  timestamps: true,
});

const OrganizationModel = model<IOrganizationDocument>(
  "organization",
  organizationSchema
);
export default OrganizationModel;
