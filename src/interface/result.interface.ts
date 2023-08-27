import { Document } from "mongoose";
import { IOrganization } from "./organization.interface";
import { EClassTerm } from "./class.interface";
import { EStatus } from "./lesson.interface";
import { IStudent } from "./student.interface";

export enum EGrade {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  F = "F",
}

export interface IResultBlocks {
  _id?: string;
  subject: string | IStudent;
  mid_term_test: number;
  ca_score: number;
  exam_score: number;
  total: number;
  grade: EGrade;
}

export interface IResult {
  organization: string | IOrganization;
  student: string | IStudent;
  session: string;
  term: EClassTerm;
  blocks: Array<IResultBlocks>;
  status?: EStatus;
}

export interface IResultDocument extends IResult, Document {}
