import { Document } from "mongoose";
import { IOrganization } from "./organization.interface";

export enum EClassTerm {
  FIRST_TERM = "first_term",
  SECOND_TERM = "second_term",
  THIRD_TERM = "third_term",
}

export enum EClassLevel {
  Junior = "junior",
  Senior = "senior",
}

export enum EClassLevelSection {
  Science = "science",
  Art = "art",
  Commercial = "commercial",
  Others = "others",
}

export interface IClass {
  organization: string | IOrganization;
  name: string;
  level: EClassLevel;
  section?: EClassLevelSection;
  other_section?: string;
  is_active?: boolean;
}

export interface IClassDocument extends IClass, Document {}
