import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { GetDashboard } from "../services/dashboard.services";
import { ICustomInterface } from "../interface";

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const { account } = req;

    const query: ICustomInterface = {
      organization: new ObjectId(account.organization_id),
    };

    const response = await GetDashboard(query);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
