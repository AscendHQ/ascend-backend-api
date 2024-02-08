import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import { ObjectId } from "mongodb";
import {
  RegisterSubject,
  GetClassesWithStudents,
  GetStudentRegistration,
  UpdateRegisteredSubject,
} from "../services/subject_registration.services";

export const getClassesWithStudents = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { class_id, class_name } = req.query;

    const query: ICustomInterface = {
      organization: new ObjectId(account.organization_id),
    };

    if (class_id) query._id = new ObjectId(class_id as string);
    if (class_name)
      query.name = { $regex: new RegExp(class_name as string, "i") };

    const response = await GetClassesWithStudents(query);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getStudentRegistration = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { student_id } = req.params;
    const { class_id } = req.query;

    const query: ICustomInterface = {
      organization: new ObjectId(account.organization_id),
      student: new ObjectId(student_id),
      class: new ObjectId(class_id as string),
    };

    const response = await GetStudentRegistration(query);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const registerSubject = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { student, class_id, additional_subjects, core_subjects } = req.body;

    const response = await RegisterSubject({
      organization: account.organization_id,
      student,
      class: class_id,
      core_subjects,
      additional_subjects,
    });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateRegisteredSubject = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { registration_id } = req.params;
    const { additional_subjects, core_subjects } = req.body;

    const response = await UpdateRegisteredSubject(registration_id, {
      organization: account.organization_id,
      additional_subjects,
      core_subjects,
    });

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
