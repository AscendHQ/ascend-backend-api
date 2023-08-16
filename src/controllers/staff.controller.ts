import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { AddStaff } from "../services/staff.services";

export const getAllStaff = async (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addStaff = async (req: Request, res: Response) => {
  try {
    let { bio_data, official_information, permissions, org_id } = req.body;

    bio_data.email = bio_data.email.toLowerCase();

    // check if having access

    const response = await AddStaff({
      bio_data,
      official_information,
      permissions,
      organization: org_id,
    });

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getStaffById = async (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateStaffById = async (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteStaffById = async (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
