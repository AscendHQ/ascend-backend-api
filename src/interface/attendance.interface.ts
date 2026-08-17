import { Document } from "mongoose";

import { IClass } from "./class.interface";
import { IOrganization } from "./organization.interface";
import { IStudent } from "./student.interface";

export enum EAttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  LATE = "late",
  EXCUSED = "excused",
}

export interface IAttendanceRecord {
  student: string | IStudent;
  status: EAttendanceStatus;
  remark?: string;
}

export interface IAttendance {
  organization: string | IOrganization;
  class: string | IClass;
  session: string;
  term: string;
  date: string;
  records: IAttendanceRecord[];
  recorded_by?: string;
}

export interface IAttendanceDocument extends IAttendance, Document {}
