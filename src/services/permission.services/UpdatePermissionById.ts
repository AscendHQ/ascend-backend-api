import { UpdateQuery } from "mongoose";
import { IPermissions } from "../../interface";
import PermissionModel from "../../models/permission";

export const UpdatePermissionById = async (
  permission_id: string,
  update: UpdateQuery<IPermissions>
) => {
  const permission = await PermissionModel.findByIdAndUpdate(
    permission_id,
    update,
    { new: true }
  );

  return permission;
};
