import PermissionModel from "../../models/permission";
import AccountModel from "../../models/account";

export const DeletePermissionById = async (permission_id: string) => {
  const staff_count = await AccountModel.countDocuments({
    permission: permission_id,
  });

  if (staff_count > 0) {
    throw new Error(
      `Cannot delete this role \u2014 ${staff_count} staff member(s) are still assigned to it. Reassign them first.`
    );
  }

  const permission = await PermissionModel.findByIdAndDelete(permission_id);

  return permission;
};
