import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import { ObjectId } from "mongodb";
import {
  AddSubject,
  DeleteSubjectById,
  GetAllSubject,
  GetSubjectById,
  UpdateSubjectById,
} from "../services/subject.services";

export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { limit = 50, page = 1, name, code, level } = req.query;

    const query: ICustomInterface = {
      organization: new ObjectId(account.organization_id),
    };

    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (name) query.name = { $regex: new RegExp(name as string, "i") };
    if (code) query.code = { $regex: new RegExp(code as string, "i") };
    if (level) query.level = query.level = level;

    const response = await GetAllSubject(query, options);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addSubject = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { name, code, type, level, classes } = req.body;

    const response = await AddSubject({
      organization: account.organization_id,
      name,
      code,
      type,
      level,
      classes,
    });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateSubjectById = async (req: Request, res: Response) => {
  try {
    const { subject_id } = req.params;
    const { name, code, type, level, classes } = req.body;
    const response = await UpdateSubjectById(subject_id, {
      name,
      code,
      type,
      level,
      classes,
    });
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteSubjectById = async (req: Request, res: Response) => {
  try {
    const { subject_id } = req.params;

    const response = await DeleteSubjectById(subject_id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
