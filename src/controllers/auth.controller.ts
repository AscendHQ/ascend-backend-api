import { Request, Response } from "express";
import { EAccountType } from "../interface";
import { errorResponse, successResponse } from "../utils/responseHandler";
import {
  SystemAccountSignup,
  CreateAccount,
  AccountLogin,
  ResetPassword,
  ForgotPassword,
  ChangePassword,
  SendEmailVerification,
  VerifyEmail,
  AccountExists,
} from "../services/auth.services";
import { CreateOrganization } from "../services/organization.services";
import {
  CreatePermission,
  UpdatePermissionById,
} from "../services/permission.services";

export const systemAccountSignUp = async (req: Request, res: Response) => {
  try {
    let { email, password, first_name, last_name } = req.body;

    email = email.toLowerCase();

    if (await AccountExists(email)) {
      return errorResponse(res, 409, "Conflicting data");
    }

    const response = await SystemAccountSignup({
      email,
      password,
      first_name,
      last_name,
    });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const signUpOrganization = async (req: Request, res: Response) => {
  try {
    let { organization_name, email, password, first_name, last_name } =
      req.body;

    email = email.toLowerCase();

    if (await AccountExists(email)) {
      return errorResponse(res, 409, "Conflicting data");
    }

    const organization = await CreateOrganization({
      name: organization_name,
    });

    const permission = await CreatePermission({
      organization: organization._id,
      name: "Admin",
      description: "Full access to every module. Assigned to the school's primary account.",
      dashboard: { create: true, view: true, edit: true, delete: true },
      staff: { create: true, view: true, edit: true, delete: true },
      students: { create: true, view: true, edit: true, delete: true },
      subjects: { create: true, view: true, edit: true, delete: true },
      classes: { create: true, view: true, edit: true, delete: true },
      teachers: { create: true, view: true, edit: true, delete: true },
      hostels: { create: true, view: true, edit: true, delete: true },
      lesson_plan: { create: true, view: true, edit: true, delete: true },
      time_table: { create: true, view: true, edit: true, delete: true },
      results: { create: true, view: true, edit: true, delete: true },
      administration: { create: true, view: true, edit: true, delete: true },
      payroll: { create: true, view: true, edit: true, delete: true },
      roles: { create: true, view: true, edit: true, delete: true },
    });

    const response = await CreateAccount({
      first_name,
      last_name,
      password,
      email,
      organization: organization._id,
      permission: permission._id,
      account_type: EAccountType.ADMIN,
    });

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const accountLogin = async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body;

    email = email.toLowerCase();

    const response = await AccountLogin(email, password);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const accountEmailExists = async (req: Request, res: Response) => {
  try {
    let { email } = req.query;

    email = (email as string).toLowerCase();

    const response = await AccountExists(email || "");

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const accountEmailVerification = async (req: Request, res: Response) => {
  try {
    const { tkn } = req.query;

    const response = await VerifyEmail(tkn as unknown as string);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const sendEmailVerification = async (req: Request, res: Response) => {
  try {
    let { email } = req.body;

    email = (email as string).toLowerCase();

    await SendEmailVerification(email);

    return successResponse(res, 200, "Verification link sent");
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { old_password, new_password, confirm_password } = req.body;

    if (new_password !== confirm_password) {
      return errorResponse(res, 400, "Passwords do not match");
    }

    const response = await ChangePassword(
      old_password,
      new_password,
      account.account_id
    );

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const forgetPassword = (req: Request, res: Response) => {
  try {
    let { email } = req.body;

    email = (email as string).toLowerCase();

    ForgotPassword(email);

    return successResponse(res, 200, "Password reset email sent");
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { tkn } = req.query;
    const { password } = req.body;

    const response = await ResetPassword(tkn as unknown as string, password);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
