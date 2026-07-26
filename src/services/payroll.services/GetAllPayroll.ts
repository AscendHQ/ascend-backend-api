import PayrollModel from "../../models/payroll";
import { ICustomInterface } from "../../interface";

export const GetAllPayroll = async (
  query: ICustomInterface,
  options: ICustomInterface
) => {
  const { limit, page } = options;

  const payrolls_promise = PayrollModel.find({
    ...query,
    date_deleted: { $exists: false },
  })
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 })
    .exec();

  const total_documents_promise = PayrollModel.countDocuments({
    ...query,
    date_deleted: { $exists: false },
  });

  const [payrolls, total_documents] = await Promise.all([
    payrolls_promise,
    total_documents_promise,
  ]);

  return {
    limit,
    page,
    payrolls,
    total_documents,
  };
};
