import { Document } from "mongoose";
import { IOrganization } from "./organization.interface";
import { IStudent } from "./student.interface";
import { ISubject } from "./subject.interface";
import { IClass } from "./class.interface";

export interface ISubjectRegistration {
  organization: string | IOrganization;
  student: string | IStudent;
  class: string | IClass;
  additional_subjects: Array<string | ISubject>;
}

export interface ISubjectRegistrationDocument
  extends ISubjectRegistration,
    Document {}
