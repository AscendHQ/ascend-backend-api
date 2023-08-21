import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import { ObjectId } from "mongodb";
import {
  AddLesson,
  DeleteLessonById,
  GetAllLesson,
  GetLessonById,
  UpdateLessonById,
} from "../services/lesson.services";

export const getAllLessons = async (req: Request, res: Response) => {
  try {
    const {
      limit = 10,
      page = 1,
      title,
      subject,
      class_id,
      status,
    } = req.query;

    const query: ICustomInterface = {};

    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (title) query.title = { $regex: new RegExp(title as string, "i") };
    if (subject) query.subject = { $regex: new RegExp(subject as string, "i") };
    if (class_id) query.class = { $in: [new ObjectId(class_id as string)] };
    if (status) query.status = status;

    const response = await GetAllLesson(query, options);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addLesson = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { title, subject, class_id, duration, lesson_plan, objectives } =
      req.body;

    const response = await AddLesson({
      title,
      subject,
      class: class_id,
      duration,
      lesson_plan,
      objectives,
      organization: account.organization_id,
    });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getLessonById = async (req: Request, res: Response) => {
  try {
    const { lesson_id } = req.params;

    // checking if having access
    const response = await GetLessonById(lesson_id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateLessonById = async (req: Request, res: Response) => {
  try {
    const { lesson_id } = req.params;
    const { title, subject, class_id, duration, lesson_plan, objectives } =
      req.body;

    // checking if having access

    const response = await UpdateLessonById(lesson_id, {
      title,
      subject,
      class_id,
      duration,
      lesson_plan,
      objectives,
    });
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteLessonById = async (req: Request, res: Response) => {
  try {
    const { lesson_id } = req.params;

    const response = await DeleteLessonById(lesson_id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
