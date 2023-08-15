import { Document } from "mongoose";
import { IOrganization } from "./organization.interface";
import { IStaff } from "./staff.interface";
import { IStudent } from "./student.interface";

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
  class_teacher: string | IStaff;
  students: Array<string | IStudent>;
  additional_notes: string;
}

export interface IClassDocument extends IClass, Document {}
