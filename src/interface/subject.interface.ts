import { Document } from "mongoose";
import { IClass } from "./class.interface";
import { IOrganization } from "./organization.interface";
import { IStaff } from "./staff.interface";
import { EStatus } from "./lesson.interface";

export enum ESubjectDuration {
  HOUR = "hour",
  WEEK = "week",
  MONTH = "month",
}

export interface ISubject {
  organization: string | IOrganization;
  subject_name: string;
  subject_code: string;
  description: string;
  classes_offering: Array<string | IClass>;
  staff: string | IStaff;
  duration: {
    number: number;
    period: ESubjectDuration;
  };
  status?: EStatus;
}

export interface ISubjectDocument extends ISubject, Document {}
