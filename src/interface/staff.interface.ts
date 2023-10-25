import { Document } from "mongoose";
import { IOrganization } from "./organization.interface";

export enum EGender {
  MALE = "male",
  FEMALE = "female",
}

export enum EStatus {
  TEACHING = "teaching",
  NONE_TEACHING = "none_teaching",
}

export enum EEmploymentType {
  PERMANENT = "permanent",
  PART_TIME = "part_time",
}

export enum EDenomination {
  ISLAM = "islam",
  ADVENTIST = "adventist",
  NON_ADVENTIST = "non_adventist",
}

export interface IAddress {
  home_address: string;
  state_of_origin: string;
  local_government_area: string;
}

export interface INextOfKin {
  last_name: string;
  first_name: string;
  relationship: string;
  gender: EGender;
  email?: string;
  phone_number: string;
  address: IAddress;
}

export interface IStaffBioData {
  last_name: string;
  first_name: string;
  dob: Date;
  gender: EGender;
  phone_number: string;
  email: string;
}

export interface IStaffOfficialInformation {
  job_title: string;
  staff_category: string;
  employment_start_date: Date;
  employment_end_date?: Date;
  department?: string;
  educational_qualification: string;
}

export interface IStaff {
  organization: string | IOrganization;
  staff_no: string;
  surname: string;
  other_names: string;
  sex: EGender;
  status: EStatus;
  type: EEmploymentType;
  denomination: EDenomination;
  department: string;
  qualifications: Array<string>;
  post: string;
  address: string;
  phone_number: string;
  loan_received: number;
  loan_refunded: number;
  loan_debt: number;
  employment_date: Date;
  exit_date: Date;
  exit_reason: string;
  date_deleted?: Date;
}

export interface IStaffDocument extends IStaff, Document {}
