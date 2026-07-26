import { Request, Response, NextFunction } from "express";
import { ESystemAccessLevel } from "../interface";
import { errorResponse } from "../utils/responseHandler";

// Verifies the account making the request is either the account referenced
// in the URL (:account_id) or an Ascend admin. Without this, any logged-in
// user could read or edit any other account's profile by changing the id
// in the URL.
export const hasAccountAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { account } = req;
  const { account_id } = req.params;

  const isAscendAdmin = account.access_level >= ESystemAccessLevel.READ_ADMIN;
  const isOwnAccount = String(account.account_id) === String(account_id);

  if (!isAscendAdmin && !isOwnAccount) {
    return errorResponse(res, 403, "You do not have access to this account");
  }

  return next();
};
