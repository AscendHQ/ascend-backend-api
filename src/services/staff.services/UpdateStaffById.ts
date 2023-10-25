import { UpdateQuery } from "mongoose";
import { IStaff } from "../../interface";
import StaffModel from "../../models/staff";
import { ObjectId } from "mongodb";

export const UpdateStaffById = async (
  query: { staff_no: string; organization: ObjectId },
  update: UpdateQuery<IStaff>
) => {
  const staff = await StaffModel.findOneAndUpdate(query, update, {
    new: true,
  }).populate("organization");

  return staff;
};
