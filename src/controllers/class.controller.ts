import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import { ObjectId } from "mongodb";
import {
  AddClass,
  BulkAddClasses,
  DeleteClassById,
  GetAllClasses,
  GetClassById,
  UpdateClassById,
} from "../services/class.services";
import { parse } from "csv-parse/sync";
import { UpdateStudentById } from "../services/student.services";

export const getAllClasses = async (req: Request, res: Response) => {
  try {
    const {
      limit = 10,
      page = 1,
      name,
      org_id,
      class_teacher_id,
      student_id,
      session,
    } = req.query;

    const query: ICustomInterface = {};

    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (name) query.name = { $regex: new RegExp(name as string, "i") };

    if (org_id) query.organization = new ObjectId(org_id as string);

    if (class_teacher_id)
      query.class_teacher = new ObjectId(class_teacher_id as string);

    if (student_id)
      query.students = { $in: [new ObjectId(student_id as string)] };

    if (session) query.session = session;

    const response = await GetAllClasses(query, options);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addClass = async (req: Request, res: Response) => {
  try {
    const { org_id, name, session, class_teacher, students, additional_notes } =
      req.body;

    // check if having access
    const response = await AddClass({
      organization: org_id,
      name,
      size: students.length,
      session,
      class_teacher,
      students,
      additional_notes,
    });
    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const bulkAddClasses = async (req: Request, res: Response) => {
  try {
    const { file } = req;
    const { org_id } = req.body;

    // check if having access

    if (!file) {
      return errorResponse(res, 400, "Upload a file");
    }
    const data = await parse(file.buffer, {
      delimiter: ",",
      from_line: 2,
      relax_quotes: true,
    });

    const classes = data.map((each_class: any) => ({
      organization: org_id,
      name: each_class[0],
      size: each_class[1],
      session: each_class[2],
      additional_notes: each_class[3],
    }));

    const response = await BulkAddClasses(classes);

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getClassById = async (req: Request, res: Response) => {
  try {
    const { class_id } = req.params;

    //check if having access

    const response = await GetClassById(class_id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateClassById = async (req: Request, res: Response) => {
  try {
    const { class_id } = req.params;
    const {
      org_id,
      name,
      session,
      class_teacher,
      size,
      students,
      additional_notes,
    } = req.body;

    // check if having access

    const response = await UpdateClassById(class_id, {
      organization: org_id,
      name,
      session,
      size,
      class_teacher,
      students,
      additional_notes,
    });

    if (response && students.length) {
      for (const student_id of students) {
        await UpdateStudentById(student_id, {
          "academic_details.class": class_id,
        });
      }
    }

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteClassById = async (req: Request, res: Response) => {
  try {
    const { class_id } = req.params;

    // check if having access

    const response = await DeleteClassById(class_id);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
