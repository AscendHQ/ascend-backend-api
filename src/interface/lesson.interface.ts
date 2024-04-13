import { Document } from "mongoose";
import { IClass } from "./class.interface";
import { IOrganization } from "./organization.interface";

export enum ELessonDuration {
  HOUR = "hour",
  WEEK = "week",
  MONTH = "month",
}

export enum EStatus {
  APPROVED = "approved",
  PENDING = "pending",
  REJECTED = "rejected",
  ARCHIVED = "archived",
  COMPLETED = "completed",
  IN_PROGRESS = "in_progress",
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
  status?: EStatus;
}

export interface ILessonDocument extends ILesson, Document {}
