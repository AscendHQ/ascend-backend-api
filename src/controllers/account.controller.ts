import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import {
  DeleteAccountById,
  GetAccountById,
  GetAllAccounts,
  UpdateAccountById,
} from "../services/account.services";
import { InviteStaffToOrganization } from "../services/organization.services";

export const getAllAccounts = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { limit = 10, page = 1, email, first_name, last_name } = req.query;

    const query: ICustomInterface = {
      organization: new ObjectId(account.organization_id),
    };

    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (email) {
      query.email = { $regex: new RegExp(email as string, "i") };
    }
    if (first_name) {
      query.first_name = { $regex: new RegExp(first_name as string, "i") };
    }
    if (last_name) {
      query.last_name = { $regex: new RegExp(last_name as string, "i") };
    }

    const responses = await GetAllAccounts(query, options);
    return successResponse(res, 200, responses);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const inviteStaffToOrganization = async (
  req: Request,
  res: Response
) => {
  try {
    const { account } = req;
    const { first_name, last_name, email, password, permission } = req.body;

    const response = await InviteStaffToOrganization({
      organization: account.organization_id,
      first_name,
      last_name,
      email,
      password,
      permission,
    });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const getAccountProfile = async (req: Request, res: Response) => {
  try {
    const { account_id } = req.params;

    const response = await GetAccountById(account_id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateAccountProfile = async (req: Request, res: Response) => {
  try {
    const { account_id } = req.params;
    const { first_name, last_name } = req.body;

    const response = await UpdateAccountById(account_id, {
      first_name,
      last_name,
    });
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteAccountProfile = async (req: Request, res: Response) => {
  try {
    const { account_id } = req.params;

    const response = await DeleteAccountById(account_id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
