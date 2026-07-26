import { ObjectId } from "mongodb";
import PermissionModel from "../../models/permission";
import AccountModel from "../../models/account";

export const GetAllPermissions = async (organization: ObjectId) => {
  const permissions = await PermissionModel.find({ organization }).sort({
    createdAt: -1,
  });

  const permissionsWithStaffCount = await Promise.all(
    permissions.map(async permission => {
      const staff_count = await AccountModel.countDocuments({
        permission: permission._id,
      });

      return { ...permission.toObject(), staff_count };
    })
  );

  return permissionsWithStaffCount;
};
