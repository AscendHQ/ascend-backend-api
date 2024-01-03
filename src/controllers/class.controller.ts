import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import { ObjectId } from "mongodb";
import {
  AddClass,
  DeleteClassById,
  GetAllClasses,
  UpdateClassById,
} from "../services/class.services";

export const getAllClasses = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { limit = 50, page = 1, name, level } = req.query;

    const query: ICustomInterface = {
      organization: new ObjectId(account.organization_id),
    };

    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (name) query.name = { $regex: new RegExp(name as string, "i") };

    if (level) query.level = level;

    const response = await GetAllClasses(query, options);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addClass = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { name, level, section, other_section } = req.body;

    const response = await AddClass({
      organization: account.organization_id,
      name,
      level,
      section,
      other_section,
    });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateClassById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { class_id } = req.params;
    const { name, level, section, other_section } = req.body;

    const response = await UpdateClassById(class_id, {
      organization: account.organization_id,
      name,
      level,
      section,
      other_section,
    });

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteClassById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { class_id } = req.params;

    const response = await DeleteClassById({
      _id: new ObjectId(class_id),
      organization: new ObjectId(account.organization_id),
    });

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
