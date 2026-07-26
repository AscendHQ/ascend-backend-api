import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import {
  DeleteOrganization,
  GetAllOrganization,
  GetOrganizationById,
  InviteStaffToOrganization,
  UpdateOrganization,
} from "../services/organization.services";

export const getAllOrg = async (req: Request, res: Response) => {
  try {
    const { limit = 10, page = 1, name } = req.query;

    const query: ICustomInterface = {};
    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (name) query.name = { $regex: new RegExp(name as string, "i") };

    const response = await GetAllOrganization(query, options);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getAnOrg = async (req: Request, res: Response) => {
  try {
    const { org_id } = req.params;

    const response = await GetOrganizationById(org_id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateOrg = async (req: Request, res: Response) => {
  try {
    const { org_id } = req.params;
    const { name, description, organization_logo, address } = req.body;

    const response = await UpdateOrganization(org_id, {
      name,
      description,
      organization_logo,
      address,
    });
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteOrg = async (req: Request, res: Response) => {
  try {
    const { org_id } = req.params;

    const response = await DeleteOrganization(org_id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const inviteStaffToOrg = async (req: Request, res: Response) => {
  try {
    let {
      email,
      last_name,
      first_name,
      dob,
      gender,
      phone_number,
      address,
      next_of_kin,
    } = req.body;

    email = email.toLowerCase();

    // check if having access
    const response = await InviteStaffToOrganization({
      email,
      last_name,
      first_name,
      dob,
      gender,
      phone_number,
      address,
      next_of_kin,
    });
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
