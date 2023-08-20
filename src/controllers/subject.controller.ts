import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import { ObjectId } from "mongodb";
import { GetAllLesson } from "../services/lesson.services";

export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const {
      limit = 10,
      page = 1,
      title,
      subject,
      class_id,
      staff_id,
      status,
      session,
    } = req.query;

    const query: ICustomInterface = {};

    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (title) query.title = { $regex: new RegExp(title as string, "i") };
    if (subject) query.title = { $regex: new RegExp(subject as string, "i") };
    if (class_id) query.class = new ObjectId(class_id as string);
    if (staff_id) query.staff = new ObjectId(staff_id as string);
    if (status) query.status = status;
    if (session) query.session = { $regex: new RegExp(session as string, "i") };

    const response = await GetAllLesson(query, options);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addSubject = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const {
      title,
      subject,
      duration,
      lesson_plan,
      objectives,
      staff,
      session,
    } = req.body;

    const response = await "";

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getSubjectById = async (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateSubjectById = async (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteSubjectById = async (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
