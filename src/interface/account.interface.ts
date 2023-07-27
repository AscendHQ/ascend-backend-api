import { Document } from "mongoose";
import { IOrganizationDocument } from "./organization.interface";

export interface IAccount {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  organization: string | IOrganizationDocument;
}

export interface IAccountDocument extends IAccount, Document {}
