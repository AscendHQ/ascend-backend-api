import { Document } from "mongoose";

export interface IOrganization {
  name: string;
  description: string;
  organization_logo: {
    path: string;
    filename: string;
  };
  address: {
    street: string;
    zip_code: string;
    country: string;
  };
  is_verified: boolean;
}

export interface IOrganizationDocument extends IOrganization, Document {}
