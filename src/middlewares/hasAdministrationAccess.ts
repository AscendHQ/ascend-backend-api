import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/responseHandler";
import { GetPermissionById } from "../services/permission.services";

// Gates actions like inviting staff, which any school's own admin
// should be able to do within their own organization - this is
// different from isAscendAdmin, which is meant for Ascend's own
// internal cross-organization actions (like creating a brand new
// school). Using access_level here would incorrectly block every
// school's own founding admin, since they get access_level NORMAL_USER
// by default and only have elevated access through their assigned
// permission's individual module flags.
export const hasAdministrationAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { account } = req;
    const permission = await GetPermissionById(account.permission);

    if (!permission || !permission.administration?.create) {
      return errorResponse(
        res,
        403,
        "You do not have permission to manage staff for your organization"
      );
    }

    return next();
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
