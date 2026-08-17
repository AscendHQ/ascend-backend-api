import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import { ObjectId } from "mongodb";
import {
  AddExtraSubject,
  GetClassesWithStudents,
  GetStudentRegistration,
  UpdateExtraSubject,
} from "../services/subject_registration.services";
import StudentModel from "../models/student";

const ensureActiveStudent = async (
  studentId: string,
  organizationId: string,
  classId: string
) => {
  const student = await StudentModel.exists({
    _id: new ObjectId(studentId),
    organization: new ObjectId(organizationId),
    "academic_details.class": new ObjectId(classId),
    is_active: true,
    is_deleted: false,
  });

  if (!student) {
    throw new Error("Only active students can be registered for subjects");
  }
};

export const getClassesWithStudents = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { class_id, session, term } = req.query;

    if (!class_id || !session || !term) {
      return errorResponse(res, 400, "Class, session and term are required");
    }

    const query: ICustomInterface = {
      _id: new ObjectId(class_id as string),
      organization: new ObjectId(account.organization_id),
    };

    const response = await GetClassesWithStudents(
      query,
      session as string,
      term as string
    );

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getStudentRegistration = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { student_id } = req.params;
    const { class_id, session, term } = req.query;

    if (!class_id || !session || !term) {
      return errorResponse(res, 400, "Class, session and term are required");
    }

    await ensureActiveStudent(
      student_id,
      account.organization_id,
      class_id as string
    );

    const query: ICustomInterface = {
      organization: new ObjectId(account.organization_id),
      student: new ObjectId(student_id),
      class: new ObjectId(class_id as string),
    };
    if (session) query.session = session;
    if (term) query.term = term;

    const response = await GetStudentRegistration(query);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addExtraSubject = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const {
      student,
      class_id,
      session,
      term,
      selected_subjects,
      additional_subjects,
    } = req.body;
    const subjects = selected_subjects ?? additional_subjects;

    if (
      !student ||
      !class_id ||
      !session ||
      !term ||
      !Array.isArray(subjects)
    ) {
      return errorResponse(
        res,
        400,
        "Student, class, session, term and selected subjects are required"
      );
    }

    await ensureActiveStudent(student, account.organization_id, class_id);

    const response = await AddExtraSubject({
      organization: account.organization_id,
      student,
      class: class_id,
      session,
      term,
      selected_subjects: subjects,
    });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateExtraSubject = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { registration_id } = req.params;
    const { selected_subjects, additional_subjects } = req.body;
    const subjects = selected_subjects ?? additional_subjects;

    if (!Array.isArray(subjects)) {
      return errorResponse(res, 400, "Selected subjects are required");
    }

    const response = await UpdateExtraSubject(registration_id, {
      organization: account.organization_id,
      selected_subjects: subjects,
    });

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
