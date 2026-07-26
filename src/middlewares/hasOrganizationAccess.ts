import { Request, Response, NextFunction } from "express";
import { ESystemAccessLevel } from "../interface";
import { errorResponse } from "../utils/responseHandler";

// Verifies the account making the request belongs to the organization
// referenced in the URL (:org_id), so one school can never read, edit,
// or delete another school's organization record. Ascend's own internal
// admins are exempt since they legitimately manage every organization.
export const hasOrganizationAccess = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { account } = req;
  const { org_id } = req.params;

  const isAscendAdmin = account.access_level >= ESystemAccessLevel.READ_ADMIN;
  const belongsToOrg = String(account.organization_id) === String(org_id);

  if (!isAscendAdmin && !belongsToOrg) {
    return errorResponse(res, 403, "You do not have access to this organization");
  }

  return next();
};
