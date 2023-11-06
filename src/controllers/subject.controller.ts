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
    const {
      limit = 10,
      page = 1,
      subject_name,
      subject_code,
      class_id,
      staff_id,
      status,
    } = req.query;

    const query: ICustomInterface = {};

    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (subject_name)
      query.subject_name = { $regex: new RegExp(subject_name as string, "i") };
    if (subject_code)
      query.subject_code = { $regex: new RegExp(subject_code as string, "i") };
    if (class_id)
      query.classes_offering = { $in: [new ObjectId(class_id as string)] };
    if (staff_id) query.staff = new ObjectId(staff_id as string);
    if (status) query.status = status;

    const response = await GetAllSubject(query, options);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addSubject = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const {
      subject_name,
      subject_code,
      description,
      classes_offering,
      staff,
      duration,
    } = req.body;

    // check if having access

    const response = await AddSubject({
      subject_name,
      subject_code,
      description,
      classes_offering,
      staff,
      duration,
      organization: account.organization_id,
    });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getSubjectById = async (req: Request, res: Response) => {
  try {
    const { subject_id } = req.params;

    // check if having access
    const response = await GetSubjectById(subject_id);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateSubjectById = async (req: Request, res: Response) => {
  try {
    const { subject_id } = req.params;
    const {
      subject_name,
      subject_code,
      description,
      classes_offering,
      staff,
      duration,
      status,
    } = req.body;

    // check if having access

    const response = await UpdateSubjectById(subject_id, {
      subject_name,
      subject_code,
      description,
      classes_offering,
      staff,
      duration,
      status,
    });
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteSubjectById = async (req: Request, res: Response) => {
  try {
    const { subject_id } = req.params;

    // check if having access

    const response = await DeleteSubjectById(subject_id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
