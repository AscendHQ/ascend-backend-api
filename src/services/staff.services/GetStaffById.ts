import { ObjectId } from "mongodb";
import StaffModel from "../../models/staff";

export const GetStaffById = async (
  staff_no: string,
  organization: ObjectId
) => {
  const staff = await StaffModel.findOne({
    staff_no,
    organization,
  }).populate("organization");

  return staff;
};
