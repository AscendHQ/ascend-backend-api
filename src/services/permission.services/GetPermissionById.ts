import PermissionModel from "../../models/permission";

export const GetPermissionById = async (permission_id: string) => {
  const permission = await PermissionModel.findById(permission_id);

  return permission;
};
