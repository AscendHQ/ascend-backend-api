import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import {
  AddStudent,
  DeleteStudentById,
  GetAllStudents,
  UpdateStudentById,
  GetNextStudentNumber,
} from "../services/student.services";
import { UpdateOrganization } from "../services/organization.services";

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const {
      limit = 50,
      page = 1,
      name,
      registration_number,
      is_active,
      is_deleted,
    } = req.query;

    const query: ICustomInterface = {
      organization: account.organization_id,
      is_deleted: false,
    };

    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (name) {
      const regexName = new RegExp(name as string, "i");
      query["$or"] = [
        { "personal_information.first_name": { $regex: regexName } },
        { "personal_information.last_name": { $regex: regexName } },
        { "personal_information.middle_name": { $regex: regexName } },
      ];
    }
    if (registration_number) query.registration_number = registration_number;
    if (is_active) query.is_active = is_active == "false" ? false : true;
    if (is_deleted) query.is_deleted = is_deleted == "false" ? false : true;

    const response = await GetAllStudents(query, options);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addStudent = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const {
      personal_information,
      contact_information,
      guardian_information,
      academic_details,
      accommodation,
      medical_information,
      additional_information,
    } = req.body;

    const registration_number = await GetNextStudentNumber(
      account.organization_id
    );

    const response = await AddStudent({
      organization: account.organization_id,
      registration_number,
      personal_information,
      contact_information,
      guardian_information,
      academic_details,
      accommodation,
      medical_information,
      additional_information,
    });

    UpdateOrganization(account.organization_id, {
      last_student_id: response.registration_number,
    });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateStudentById = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;
    const {
      personal_information,
      contact_information,
      guardian_information,
      academic_details,
      accommodation,
      medical_information,
      additional_information,
      is_active,
    } = req.body;

    const response = await UpdateStudentById(student_id, {
      personal_information,
      contact_information,
      guardian_information,
      academic_details,
      accommodation,
      medical_information,
      additional_information,
      is_active,
    });

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteStudentById = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;

    const response = await DeleteStudentById(student_id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
