import { Request, Response } from "express";
import { parse } from "csv-parse/sync";
import { ObjectId } from "mongodb";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import {
  AddStudent,
  DeleteStudentById,
  GetAllStudents,
  UpdateStudentById,
  GetNextStudentNumber,
  BulkAddStudents,
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

export const bulkAddStudent = async (req: Request, res: Response) => {
  try {
    const { account, file } = req;

    if (!file) {
      return errorResponse(res, 400, "Upload a file");
    }

    const data = await parse(file.buffer, {
      delimiter: ",",
      from_line: 2,
      relax_quotes: true,
    });

    const students = data.map((each_student: any) => ({
      organization: account.organization_id,
      registration_number: each_student[0],
      personal_information: {
        first_name: each_student[1],
        middle_name: each_student[2],
        last_name: each_student[3],
        gender: each_student[4],
        dob: each_student[5],
        religion: each_student[6],
        nationality: each_student[7],
      },
      contact_information: {
        residential_address: each_student[8],
        contact_number: each_student[9],
      },
      guardian_information: {
        first_name: each_student[10],
        last_name: each_student[11],
        relationship_with_student: each_student[12],
        contact_number: each_student[13],
        email: each_student[14],
      },
      academic_details: {
        previous_school: each_student[15],
      },
      accommodation: {
        block: each_student[16],
        room: each_student[17],
      },
      medical_information: {
        allergies: each_student[18],
        emergency_contact: each_student[19],
        medication: each_student[20],
      },
      additional_information: {
        disabilities: each_student[21],
        nature_of_disability: each_student[22],
      },
    }));

    const response = await BulkAddStudents(students);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateStudentById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
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

    const response = await UpdateStudentById(
      student_id,
      new ObjectId(account.organization_id),
      {
        personal_information,
        contact_information,
        guardian_information,
        academic_details,
        accommodation,
        medical_information,
        additional_information,
        is_active,
      }
    );

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteStudentById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { student_id } = req.params;

    const response = await DeleteStudentById(
      student_id,
      new ObjectId(account.organization_id)
    );
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
