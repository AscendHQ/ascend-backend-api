import { IStaff } from "../../interface";
import StaffModel from "../../models/staff";

export const AddStaff = async (payload: IStaff) => {
  const staff = await StaffModel.create(payload);

  return staff;
};
