import { NextFunction, Request, Response } from "express";
import { GetPermissionById } from "../services/permission.services";
import { errorResponse } from "../utils/responseHandler";
import { ObjectId } from "mongodb";

export const checkPathPermission = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { account, originalUrl, method } = req;
  const permission: { [key: string]: any } | null = await GetPermissionById(
    account.permission
  );

  // check why the account organization and the permission organization are not the same and user is not an admin on ascend
  // new ObjectId(account.organization_id) !== permission.organization,
  if (!permission) {
    return errorResponse(res, 401, "Unauthorized");
  }

  const map_method_to_action: { [key: string]: string } = {
    GET: "view",
    POST: "create",
    PUT: "edit",
    PATCH: "edit",
    DELETE: "delete",
  };

  const method_action = map_method_to_action[method];

  const path_prefix = originalUrl.substring(1, 4);

  for (const each_permission in permission) {
    if (path_prefix.startsWith(each_permission.substring(0, 2))) {
      if (permission[each_permission][method_action]) {
        return next();
      }

      return errorResponse(res, 401, "Unauthorized");
    }
  }

  return errorResponse(res, 401, "Unauthorized");
};
