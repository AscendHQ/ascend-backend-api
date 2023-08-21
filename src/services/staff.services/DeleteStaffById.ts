import AccountModel from "../../models/account";
import PermissionModel from "../../models/permission";
import StaffModel from "../../models/staff";

export const DeleteStaffById = async (staff_id: string) => {
  const staff = await StaffModel.findByIdAndDelete(staff_id);

  await PermissionModel.findByIdAndDelete(staff?.permissions);
  await AccountModel.findByIdAndDelete(staff?.account);

  return staff;
};
