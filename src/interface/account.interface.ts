import { Document } from "mongoose";
import { IOrganizationDocument } from "./organization.interface";

export interface IAccount {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  organization: string | IOrganizationDocument;
  access_level: number;
  is_email_verified: boolean;
  is_verified: boolean;
  verification_token: string;
  token_validity: Date;
  last_login: Date;
}

export interface IAccountDocument extends IAccount, Document {}
