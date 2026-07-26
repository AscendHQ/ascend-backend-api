import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { errorResponse, successResponse } from "../utils/responseHandler";
import {
  GeneratePayroll,
  GetAllPayroll,
  GetPayrollById,
  UpdatePayrollById,
  DeletePayrollById,
} from "../services/payroll.services";
import { ICustomInterface } from "../interface";

export const getAllPayroll = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { limit = 100, page = 1, academic_year, month, status } = req.query;

    const query: ICustomInterface = {
      organization: new ObjectId(account.organization_id),
    };

    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (academic_year) query.academic_year = academic_year;
    if (month) query.month = month;
    if (status) query.status = status;

    const response = await GetAllPayroll(query, options);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const generatePayroll = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const {
      staff,
      staff_no,
      staff_name,
      job_title,
      bank_name,
      account_number,
      academic_year,
      month,
      basic_salary,
      breakdown,
    } = req.body;

    const response = await GeneratePayroll({
      organization: account.organization_id,
      staff,
      staff_no,
      staff_name,
      job_title,
      bank_name,
      account_number,
      academic_year,
      month,
      basic_salary,
      breakdown,
    });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getPayrollById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { id } = req.params;

    const response = await GetPayrollById(
      id,
      new ObjectId(account.organization_id)
    );
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updatePayrollById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { id } = req.params;
    const {
      job_title,
      bank_name,
      account_number,
      basic_salary,
      breakdown,
      status,
    } = req.body;

    const query = {
      _id: id,
      organization: new ObjectId(account.organization_id),
    };

    const response = await UpdatePayrollById(query, {
      job_title,
      bank_name,
      account_number,
      basic_salary,
      breakdown,
      status,
    });

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deletePayrollById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { id } = req.params;

    const response = await DeletePayrollById(
      id,
      new ObjectId(account.organization_id)
    );
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
