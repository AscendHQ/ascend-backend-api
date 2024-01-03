import { Document } from "mongoose";
import { EClassLevel, IClass } from "./class.interface";
import { IOrganization } from "./organization.interface";

export enum ESubjectDuration {
  HOUR = "hour",
  WEEK = "week",
  MONTH = "month",
}

export enum ESubjectType {
  Core = "core",
  Elective = "elective",
}

export interface ISubject {
  organization: string | IOrganization;
  name: string;
  code: string;
  type: ESubjectType;
  level: EClassLevel;
  classes: Array<string | IClass>;
}

export interface ISubjectDocument extends ISubject, Document {}
