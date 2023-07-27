import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";

export const getAllAccounts = (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getAccountProfile = (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateAccountProfile = (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteAccountProfile = (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
