import { Document } from "mongoose";
import { IOrganizationDocument } from "./organization.interface";
import { IPermissionsDocument } from "./permission.interface";

export enum EAccountType {
  ADMIN = "admin",
  STAFF = "staff",
  TEACHER = "teacher",
  PARENT = "parent",
  STUDENT = "student",
}

export interface IAccount {
  first_name: string;
  last_name: string;
  email: string;
  login_id?: string;
  password: string;
  organization: string | IOrganizationDocument;
  permission: string | IPermissionsDocument;
  access_level: number;
  is_email_verified: boolean;
  is_verified: boolean;
  verification_token: string;
  token_validity: Date;
  last_login: Date;
  account_type?: EAccountType;
}

export interface IAccountDocument extends IAccount, Document {}
