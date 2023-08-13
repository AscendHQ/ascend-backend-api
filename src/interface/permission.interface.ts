import { Document } from "mongoose";
import { IOrganization } from "./organization.interface";
import { IStaff } from "./staff.interface";

export interface IPermissionList {
  create: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
}

export interface IPermissions {
  dashboard: IPermissionList;
  students: IPermissionList;
  subjects: IPermissionList;
  classes: IPermissionList;
  teachers: IPermissionList;
  hostel: IPermissionList;
  lesson_plan: IPermissionList;
  time_table: IPermissionList;
  results: IPermissionList;
  administration: IPermissionList;
  payroll: IPermissionList;
  organization: string | IOrganization;
  staff: string | IStaff;
}

export interface IPermissionsDocument extends IPermissions, Document {}
