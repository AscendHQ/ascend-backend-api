import { Document } from "mongoose";
import { IAccount } from "./account.interface";
import { IOrganization } from "./organization.interface";
import { IPermissions } from "./permission.interface";

export enum EGender {
  MALE = "male",
  FEMALE = "female",
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
  staff_id: string;
  last_name: string;
  first_name: string;
  dob: string;
  gender: EGender;
  phone_number: string;
  address: IAddress;
  next_of_kin: INextOfKin;
  picture: {
    path: string;
    filename: string;
    key: string;
  };
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
  bio_data: IStaffBioData;
  official_information: IStaffOfficialInformation;
  permissions: IPermissions;
  organization: string | IOrganization;
  account?: string | IAccount;
}

export interface IStaffDocument extends IStaff, Document {}
