import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import {
  DeleteOrganization,
  GetAllOrganization,
  GetOrganizationById,
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
    const { name, description, organization_logo, address, academic_settings } =
      req.body;

    if (academic_settings) {
      const validTerms = ["1st Term", "2nd Term", "3rd Term"];
      const sessionPattern = /^\d{4}\/\d{4}$/;
      const { current_session, current_term, term_length_weeks, pass_mark } =
        academic_settings;

      if (
        typeof current_session !== "string" ||
        !sessionPattern.test(current_session) ||
        typeof current_term !== "string" ||
        !validTerms.includes(current_term) ||
        !Number.isFinite(term_length_weeks) ||
        term_length_weeks < 1 ||
        term_length_weeks > 30 ||
        !Number.isFinite(pass_mark) ||
        pass_mark < 0 ||
        pass_mark > 100
      ) {
        return errorResponse(res, 400, "Invalid academic settings");
      }
    }

    const response = await UpdateOrganization(org_id, {
      name,
      description,
      organization_logo,
      address,
      academic_settings,
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
