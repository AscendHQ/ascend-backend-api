import { Document } from "mongoose";
import { IOrganization } from "./organization.interface";

export enum EClassTerm {
  FIRST_TERM = "first_term",
  SECOND_TERM = "second_term",
  THIRD_TERM = "third_term",
}

export interface IClass {
  organization: string | IOrganization;
  name: string;
  size: number;
  session: string;
  term: EClassTerm;
}

export interface IClassDocument extends IClass, Document {}
