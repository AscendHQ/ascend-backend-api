import { ObjectId } from "mongodb";
import { UpdateQuery } from "mongoose";
import { EBreakdownType, IPayroll, IPayrollBreakdownItem } from "../../interface";
import PayrollModel from "../../models/payroll";

const sumByType = (breakdown: IPayrollBreakdownItem[], type: EBreakdownType) =>
  breakdown
    .filter(item => item.type === type)
    .reduce((total, item) => total + (Number(item.amount) || 0), 0);

export const UpdatePayrollById = async (
  query: { _id: string; organization: ObjectId },
  update: UpdateQuery<IPayroll>
) => {
  if (update.breakdown) {
    const total_allowances = sumByType(update.breakdown, EBreakdownType.ALLOWANCE);
    const total_deductions = sumByType(update.breakdown, EBreakdownType.DEDUCTION);
    const basic_salary = update.basic_salary ?? 0;

    update.total_allowances = total_allowances;
    update.total_deductions = total_deductions;
    update.net_pay = basic_salary + total_allowances - total_deductions;
  }

  const payroll = await PayrollModel.findOneAndUpdate(query, update, {
    new: true,
  }).populate("staff");

  return payroll;
};
