import { UpdateQuery } from "mongoose";
import { IPermissions } from "../../interface";
import PermissionModel from "../../models/permission";

export const UpdatePermission = async (
  staff_id: string,
  update: UpdateQuery<IPermissions>
) => {
  const permission = await PermissionModel.findOneAndUpdate(
    { staff: staff_id },
    update,
    { new: true }
  );

  return permission;
};
