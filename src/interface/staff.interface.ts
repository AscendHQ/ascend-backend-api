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
  account?: string | IAccount;
  permissions: string | IPermissions;
  staff_org_id: string;
  address: IAddress;
  next_of_kin: INextOfKin;
  picture: {
    path: string;
    filename: string;
    key: string;
  };
  bio_data: IStaffBioData;
  official_information: IStaffOfficialInformation;
  is_active?: boolean;
}

export interface IStaffDocument extends IStaff, Document {}
