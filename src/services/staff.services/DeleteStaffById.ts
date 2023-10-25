import { ObjectId } from "mongodb";
import StaffModel from "../../models/staff";

export const DeleteStaffById = async (
  staff_no: string,
  organization: ObjectId
) => {
  const staff = await StaffModel.findOneAndUpdate(
    { staff_no, organization },
    { date_deleted: new Date() },
    { new: true }
  );

  return staff;
};
