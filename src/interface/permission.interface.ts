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
  organization: string | IOrganization;
  name: string;
  description?: string;
  staff: IPermissionList;
  dashboard: IPermissionList;
  students: IPermissionList;
  subjects: IPermissionList;
  classes: IPermissionList;
  teachers: IPermissionList;
  hostels: IPermissionList;
  lesson_plan: IPermissionList;
  time_table: IPermissionList;
  results: IPermissionList;
  administration: IPermissionList;
  payroll: IPermissionList;
  roles: IPermissionList;
}

export interface IPermissionsDocument extends IPermissions, Document {}
