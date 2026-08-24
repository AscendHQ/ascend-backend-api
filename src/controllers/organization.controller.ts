import { Request, Response } from "express";
import { hash } from "bcryptjs";
import { ObjectId } from "mongodb";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { EAccountType, ICustomInterface } from "../interface";
import AccountModel from "../models/account";
import OrganizationModel from "../models/organization";
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

export const updateOrganizationStatus = async (
  req: Request,
  res: Response,
) => {
  try {
    const { org_id } = req.params;
    const { is_active, reason } = req.body;
    if (!ObjectId.isValid(org_id) || typeof is_active !== "boolean") {
      return errorResponse(res, 400, "A valid school status is required");
    }
    if (org_id === req.account.organization_id) {
      return errorResponse(res, 400, "The Ascend owner account cannot be suspended");
    }
    if (
      !is_active &&
      (typeof reason !== "string" || !reason.trim() || reason.trim().length > 500)
    ) {
      return errorResponse(
        res,
        400,
        "Provide a suspension reason of no more than 500 characters",
      );
    }

    const school = await OrganizationModel.findById(org_id);
    if (!school) return errorResponse(res, 404, "School not found");

    school.is_active = is_active;
    school.suspended_at = is_active ? undefined : new Date();
    school.suspended_by = is_active ? undefined : req.account.account_id;
    school.suspension_reason = is_active ? undefined : reason.trim();
    await school.save();

    return successResponse(res, 200, {
      id: school._id,
      is_active: school.is_active,
      suspended_at: school.suspended_at,
      suspension_reason: school.suspension_reason,
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const resetOrganizationAdminPassword = async (
  req: Request,
  res: Response,
) => {
  try {
    const { org_id } = req.params;
    const { password } = req.body;
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/;
    if (!ObjectId.isValid(org_id) || !passwordPattern.test(password ?? "")) {
      return errorResponse(
        res,
        400,
        "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol",
      );
    }
    if (org_id === req.account.organization_id) {
      return errorResponse(
        res,
        400,
        "Change the owner password from Account Settings",
      );
    }

    const admin = await AccountModel.findOne({
      organization: new ObjectId(org_id),
      account_type: EAccountType.ADMIN,
    }).sort({ createdAt: 1 });
    if (!admin) return errorResponse(res, 404, "School administrator not found");

    admin.password = await hash(password, 10);
    admin.session_version = (admin.session_version ?? 0) + 1;
    await admin.save();

    return successResponse(res, 200, {
      email: admin.email,
      message: "Administrator password reset and previous sessions ended",
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
