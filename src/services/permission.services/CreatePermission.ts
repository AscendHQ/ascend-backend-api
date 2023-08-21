import PermissionModel from "../../models/permission";
import { IPermissions } from "../../interface";

export const CreatePermission = async (payload: Partial<IPermissions>) => {
  const permission = await PermissionModel.create(payload);

  return permission;
};
