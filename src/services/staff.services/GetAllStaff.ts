import StaffModel from "../../models/staff";
import { ICustomInterface } from "../../interface";

export const GetAllStaff = async (
  query: ICustomInterface,
  options: ICustomInterface
) => {
  const { limit, page } = options;

  const staffs = await StaffModel.find(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .exec();

  const total_documents = await StaffModel.countDocuments(query);

  return {
    limit,
    page,
    staffs,
    total_documents,
  };
};
