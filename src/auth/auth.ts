import { Request, Response, NextFunction } from "express";
import { ESystemAccessLevel, IAccountAuthInfoRequest } from "../interface";
import { verify } from "jsonwebtoken";
import { errorResponse } from "../utils/responseHandler";
import { config } from "../config/env";

const { JWT_SECRET } = config;

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["access-token"] as string;

  if (token) {
    verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return errorResponse(res, 403, "invalid token");
      }
      req.account = decoded as IAccountAuthInfoRequest;
      return next();
    });
  } else {
    return errorResponse(res, 403, "request not authenticated");
  }
};

export const isEmailVerified = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { account } = req;

  if (!account.is_email_verified) {
    return errorResponse(res, 401, "Email not verified");
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
    return errorResponse(res, 401, "Unauthorized");

  return next();
};
