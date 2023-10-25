import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import {
  AddStaff,
  DeleteStaffById,
  GetAllStaff,
  GetNextStaffNumber,
  GetStaffById,
  UpdateStaffById,
} from "../services/staff.services";
import { ICustomInterface } from "../interface";
import { ObjectId } from "mongodb";
import { UpdateOrganization } from "../services/organization.services";

export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { limit = 100, page = 1, staff_no, status, type } = req.query;

    const query: ICustomInterface = {
      organization: new ObjectId(account.organization_id),
    };

    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (staff_no) query.staff_no = staff_no;
    if (status) query.status = status;
    if (type) query.type = type;

    const response = await GetAllStaff(query, options);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getNextStaffNumber = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { staff_no } = req.query;

    const response = await GetNextStaffNumber(
      account.organization_id,
      staff_no as string
    );

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addStaff = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const {
      staff_no,
      surname,
      other_names,
      sex,
      status,
      type,
      denomination,
      department,
      qualifications,
      post,
      address,
      phone_number,
      loan_received,
      loan_refunded,
      loan_debt,
      employment_date,
      exit_date,
      exit_reason,
    } = req.body;

    const response = await AddStaff({
      organization: account.organization_id,
      staff_no,
      surname,
      other_names,
      sex,
      status,
      type,
      denomination,
      department,
      qualifications,
      post,
      address,
      phone_number,
      loan_received,
      loan_refunded,
      loan_debt,
      employment_date,
      exit_date,
      exit_reason,
    });

    UpdateOrganization(account.organization_id, { last_staff_id: staff_no });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getStaffById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { staff_no } = req.params;

    const response = await GetStaffById(
      staff_no,
      new ObjectId(account.organization_id)
    );
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateStaffById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { staff_no } = req.params;
    const {
      surname,
      other_names,
      sex,
      status,
      type,
      denomination,
      department,
      qualifications,
      post,
      address,
      phone_number,
      loan_received,
      loan_refunded,
      loan_debt,
      employment_date,
      exit_date,
      exit_reason,
    } = req.body;

    const query = {
      staff_no,
      organization: new ObjectId(account.organization_id),
    };

    const response = await UpdateStaffById(query, {
      surname,
      other_names,
      sex,
      status,
      type,
      denomination,
      department,
      qualifications,
      post,
      address,
      phone_number,
      loan_received,
      loan_refunded,
      loan_debt,
      employment_date,
      exit_date,
      exit_reason,
    });

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteStaffById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { staff_no } = req.params;

    const response = await DeleteStaffById(
      staff_no,
      new ObjectId(account.organization_id)
    );
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
