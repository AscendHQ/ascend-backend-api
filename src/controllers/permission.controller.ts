import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { errorResponse, successResponse } from "../utils/responseHandler";
import {
  CreatePermission,
  GetAllPermissions,
  GetPermissionById,
  UpdatePermissionById,
  DeletePermissionById,
} from "../services/permission.services";

export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    const { account } = req;

    const response = await GetAllPermissions(
      new ObjectId(account.organization_id)
    );

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const createPermission = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const {
      name,
      description,
      staff,
      dashboard,
      students,
      subjects,
      classes,
      teachers,
      hostels,
      lesson_plan,
      time_table,
      results,
      administration,
      payroll,
      roles,
    } = req.body;

    const defaultPermission = {
      create: false,
      view: false,
      edit: false,
      delete: false,
    };

    const response = await CreatePermission({
      organization: account.organization_id,
      name,
      description,
      staff: staff ?? defaultPermission,
      dashboard: dashboard ?? defaultPermission,
      students: students ?? defaultPermission,
      subjects: subjects ?? defaultPermission,
      classes: classes ?? defaultPermission,
      teachers: teachers ?? defaultPermission,
      hostels: hostels ?? defaultPermission,
      lesson_plan: lesson_plan ?? defaultPermission,
      time_table: time_table ?? defaultPermission,
      results: results ?? defaultPermission,
      administration: administration ?? defaultPermission,
      payroll: payroll ?? defaultPermission,
      roles: roles ?? defaultPermission,
    });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const response = await GetPermissionById(id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updatePermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      staff,
      dashboard,
      students,
      subjects,
      classes,
      teachers,
      hostels,
      lesson_plan,
      time_table,
      results,
      administration,
      payroll,
      roles,
    } = req.body;

    const response = await UpdatePermissionById(id, {
      name,
      description,
      staff,
      dashboard,
      students,
      subjects,
      classes,
      teachers,
      hostels,
      lesson_plan,
      time_table,
      results,
      administration,
      payroll,
      roles,
    });

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deletePermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const response = await DeletePermissionById(id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};
