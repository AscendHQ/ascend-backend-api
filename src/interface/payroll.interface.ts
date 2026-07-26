import { Document } from "mongoose";
import { IOrganization } from "./organization.interface";
import { IStaff } from "./staff.interface";

export enum EPayrollStatus {
  PENDING = "pending",
  GENERATED = "generated",
  PAID = "paid",
}

export enum EBreakdownType {
  ALLOWANCE = "allowance",
  DEDUCTION = "deduction",
}

export interface IPayrollBreakdownItem {
  label: string;
  amount: number;
  type: EBreakdownType;
}

export interface IPayroll {
  organization: string | IOrganization;
  staff: string | IStaff;
  staff_no: string;
  staff_name: string;
  job_title: string;
  bank_name: string;
  account_number: string;
  academic_year: string;
  month: string;
  basic_salary: number;
  breakdown: IPayrollBreakdownItem[];
  total_allowances: number;
  total_deductions: number;
  net_pay: number;
  status: EPayrollStatus;
  date_deleted?: Date;
}

export interface IPayrollDocument extends IPayroll, Document {}
