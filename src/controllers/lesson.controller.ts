import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";

export const getAllLessons = async (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
