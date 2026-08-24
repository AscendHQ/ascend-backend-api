import { Request, Response, NextFunction } from "express";
import { ESystemAccessLevel, IAccountAuthInfoRequest } from "../interface";
import { verify } from "jsonwebtoken";
import { errorResponse } from "../utils/responseHandler";
import { config } from "../config/env";
import AccountModel from "../models/account";
import OrganizationModel from "../models/organization";

const { JWT_SECRET } = config;

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["access-token"] as string;

  if (token) {
    verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) {
        return errorResponse(res, 401, "invalid token");
      }
      try {
        const tokenAccount = decoded as IAccountAuthInfoRequest;
        const [account, organization] = await Promise.all([
          AccountModel.findById(tokenAccount.account_id).select(
            "organization session_version",
          ),
          OrganizationModel.findById(tokenAccount.organization_id).select(
            "is_active",
          ),
        ]);
        if (
          !account ||
          String(account.organization) !== tokenAccount.organization_id ||
          (account.session_version ?? 0) !==
            (tokenAccount.session_version ?? 0)
        ) {
          return errorResponse(res, 401, "invalid token");
        }
        if (organization?.is_active === false) {
          return errorResponse(res, 403, "School account is suspended");
        }
        req.account = tokenAccount;
        return next();
      } catch (authError: any) {
        return errorResponse(res, 500, authError.message);
      }
    });
  } else {
    return errorResponse(res, 401, "request not authenticated");
  }
};

export const isEmailVerified = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { account } = req;

  if (!account.is_email_verified) {
    return errorResponse(res, 403, "Email not verified");
  }

  return next();
};

export const isAscendAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { account } = req;

  if (account.access_level < ESystemAccessLevel.READ_ADMIN)
    return errorResponse(res, 403, "Unauthorized");

  return next();
};
