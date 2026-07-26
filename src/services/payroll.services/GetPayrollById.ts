import { ObjectId } from "mongodb";
import PayrollModel from "../../models/payroll";

export const GetPayrollById = async (id: string, organization: ObjectId) => {
  const payroll = await PayrollModel.findOne({
    _id: id,
    organization,
    date_deleted: { $exists: false },
  }).populate("staff");

  return payroll;
};
