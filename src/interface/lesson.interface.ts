import { Document } from "mongoose";
import { IClass } from "./class.interface";
import { IOrganization } from "./organization.interface";
import { IStaff } from "./staff.interface";

export enum ELessonDuration {
  HOUR = "hour",
  WEEK = "week",
  MONTH = "month",
}

export enum ELessonStatus {
  APPROVED = "approved",
  PENDING = "pending",
  REJECTED = "rejected",
}

export interface ILesson {
  organization: string | IOrganization;
  title: string;
  subject: string;
  class: Array<string | IClass>;
  duration: {
    number: number;
    period: ELessonDuration;
  };
  lesson_plan: string;
  objectives: string;
  staff: string | IStaff;
  status: ELessonStatus;
  session: string;
}

export interface ILessonDocument extends ILesson, Document {}
