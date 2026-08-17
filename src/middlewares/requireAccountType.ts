import { NextFunction, Request, Response } from "express";

import { EAccountType } from "../interface";
import AccountModel from "../models/account";
import PermissionModel from "../models/permission";
import { errorResponse } from "../utils/responseHandler";

export const requireAccountType = (...allowedTypes: EAccountType[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await AccountModel.findById(req.account.account_id).select(
        "account_type permission",
      );
      if (!account) return errorResponse(res, 401, "Unauthorized");
      let accountType = account.account_type;
      if (!accountType) {
        const permission = await PermissionModel.findById(
          account.permission,
        ).select("name");
        accountType =
          permission?.name.toLowerCase() === "admin"
            ? EAccountType.ADMIN
            : EAccountType.STAFF;
      }
      if (!allowedTypes.includes(accountType)) {
        return errorResponse(res, 403, "This portal is not available to your account");
      }
      req.account.account_type = accountType;
      return next();
    } catch (error: any) {
      return errorResponse(res, 500, error.message);
    }
  };
