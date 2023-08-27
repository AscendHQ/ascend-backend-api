import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import {
  AddStudent,
  BulkAddStudents,
  DeleteStudentById,
  GetAllStudents,
  GetStudentById,
  UpdateStudentById,
} from "../services/student.services";
import { parse } from "csv-parse/sync";

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const { limit = 10, page = 1, gender, first_name, last_name } = req.query;

    const query: ICustomInterface = {};

    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (gender) query["personal_information.gender"] = gender;
    if (first_name)
      query["personal_information.first_name"] = {
        $regex: new RegExp(first_name as string, "i"),
      };
    if (last_name)
      query["personal_information.last_name"] = {
        $regex: new RegExp(last_name as string, "i"),
      };

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
      registration_number,
      personal_information,
      academic_details,
      lesson_offering,
      contact_information,
      guardian_information,
      medical_information,
      additional_information,
      hostel,
    } = req.body;

    // check if having access

    const response = await AddStudent({
      organization: account.organization_id,
      registration_number,
      personal_information,
      academic_details,
      lesson_offering,
      contact_information,
      guardian_information,
      medical_information,
      additional_information,
      hostel,
    });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const bulkAddStudents = async (req: Request, res: Response) => {
  try {
    const { account, file } = req;

    if (!file) {
      return errorResponse(res, 400, "Upload a file");
    }

    // check if having access

    const data = await parse(file.buffer, {
      delimiter: ",",
      from_line: 2,
      relax_quotes: true,
    });

    const students = data.map((each_student: any) => ({
      organization: account.organization_id,
      registration_number: each_student[0],
      "personal_information.first_name": each_student[1],
      "personal_information.last_name": each_student[2],
      "personal_information.gender": each_student[3],
      "personal_information.dob": each_student[4],
      "personal_information.religion": each_student[5],
      "personal_information.nationality": each_student[6],
      "academic_details.class": each_student[7],
      "academic_details.enrollment_year": each_student[8],
      "academic_details.graduation_year": each_student[9],
      lesson_offering: each_student[10],
      "contact_information.residential_address": each_student[11],
      "contact_information.phone_number": each_student[12],
      "contact_information.guardian_name": each_student[13],
      "contact_information.email": each_student[14],
      "guardian_information.first_name": each_student[15],
      "guardian_information.last_name": each_student[16],
      "guardian_information.relationship_to_student": each_student[17],
      "guardian_information.phone_number": each_student[18],
      "guardian_information.email": each_student[19],
    }));

    const response = await BulkAddStudents(students);
    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;
    // check if having access

    const response = await GetStudentById(student_id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateStudentById = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;
    const {
      personal_information,
      academic_details,
      lesson_offering,
      contact_information,
      guardian_information,
      medical_information,
      additional_information,
      hostel,
      is_active,
    } = req.body;

    // check if having access

    const response = await UpdateStudentById(student_id, {
      personal_information,
      academic_details,
      lesson_offering,
      contact_information,
      guardian_information,
      medical_information,
      additional_information,
      hostel,
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
    // check if having access
    const response = await DeleteStudentById(student_id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
