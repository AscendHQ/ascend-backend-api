import { ObjectId } from "mongodb";
import PayrollModel from "../../models/payroll";

export const DeletePayrollById = async (id: string, organization: ObjectId) => {
  const payroll = await PayrollModel.findOneAndUpdate(
    { _id: id, organization },
    { date_deleted: new Date() },
    { new: true }
  );

  return payroll;
};
