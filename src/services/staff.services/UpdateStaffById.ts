import { UpdateQuery } from "mongoose";
import { IStaff } from "../../interface";
import StaffModel from "../../models/staff";

export const UpdateStaffById = async (
  staff_id: string,
  update: UpdateQuery<IStaff>
) => {
  const staff = await StaffModel.findByIdAndUpdate(staff_id, update, {
    new: true,
  }).populate("organization permissions");

  return staff;
};
