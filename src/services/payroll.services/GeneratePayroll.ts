import { EBreakdownType, IPayroll, IPayrollBreakdownItem } from "../../interface";
import PayrollModel from "../../models/payroll";

const sumByType = (breakdown: IPayrollBreakdownItem[], type: EBreakdownType) =>
  breakdown
    .filter(item => item.type === type)
    .reduce((total, item) => total + (Number(item.amount) || 0), 0);

export const GeneratePayroll = async (
  payload: Omit<
    IPayroll,
    "total_allowances" | "total_deductions" | "net_pay" | "status"
  >
) => {
  const breakdown = payload.breakdown || [];

  const total_allowances = sumByType(breakdown, EBreakdownType.ALLOWANCE);
  const total_deductions = sumByType(breakdown, EBreakdownType.DEDUCTION);
  const net_pay = payload.basic_salary + total_allowances - total_deductions;

  const payroll = await PayrollModel.findOneAndUpdate(
    {
      organization: payload.organization,
      staff: payload.staff,
      academic_year: payload.academic_year,
      month: payload.month,
    },
    {
      ...payload,
      total_allowances,
      total_deductions,
      net_pay,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return payroll;
};
