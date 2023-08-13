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
  title: string;
  subject: string;
  class: Array<string | IClass>;
  duration_number: number;
  duration: ELessonDuration;
  lesson_plan: string;
  objectives: string;
  staff: string | IStaff;
  status: ELessonStatus;
  session: string;
  organization: string | IOrganization;
}
