import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { EGrade, ICustomInterface } from "../interface";
import { ObjectId } from "mongodb";
import ResultModel from "../models/result";
import StudentModel from "../models/student";
import SubjectModel from "../models/subject";
import SubjectRegistrationModel from "../models/subject_registration";
import {
  AddResult,
  AddToResultBlock,
  DeleteResultBlock,
  DeleteResultById,
  GetAllResults,
  GetResultById,
  UpdateResultBlock,
  UpdateResultById,
} from "../services/result.services";

const getGrade = (total: number): EGrade => {
  if (total >= 70) return EGrade.A;
  if (total >= 60) return EGrade.B;
  if (total >= 50) return EGrade.C;
  if (total >= 40) return EGrade.D;
  return EGrade.F;
};

export const getAllResults = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const {
      limit = 10,
      page = 1,
      session,
      term,
      subject_id,
      student_id,
    } = req.query;

    const query: ICustomInterface = {
      organization: new ObjectId(account.organization_id),
    };

    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (session) query.session = session;
    if (term) query.term = term;
    if (subject_id)
      query["blocks.subject"] = new ObjectId(subject_id as string);
    if (student_id) query.student = new ObjectId(student_id as string);

    const response = await GetAllResults(query, options);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addResult = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { student, session, term, blocks } = req.body;

    if (
      !ObjectId.isValid(student) ||
      !/^\d{4}\/\d{4}$/.test(session) ||
      !["1st Term", "2nd Term", "3rd Term"].includes(term) ||
      !Array.isArray(blocks) ||
      blocks.length === 0
    ) {
      return errorResponse(
        res,
        400,
        "Complete and valid result details are required",
      );
    }

    const normalizedBlocks = blocks.map((block) => {
      const mid_term_test = Number(block.mid_term_test);
      const ca_score = Number(block.ca_score);
      const exam_score = Number(block.exam_score);
      const total = mid_term_test + ca_score + exam_score;
      return {
        subject: block.subject,
        mid_term_test,
        ca_score,
        exam_score,
        total,
        grade: getGrade(total),
      };
    });

    const organization = new ObjectId(account.organization_id);
    const studentRecord = await StudentModel.findOne({
      _id: new ObjectId(student),
      organization,
      is_active: true,
      is_deleted: false,
    }).select("academic_details.class");

    if (!studentRecord?.academic_details.class) {
      return errorResponse(res, 404, "Active student not found");
    }

    const registration = await SubjectRegistrationModel.findOne({
      organization,
      student: studentRecord._id,
      class: studentRecord.academic_details.class,
      session,
      term,
    }).select("selected_subjects additional_subjects");

    if (!registration) {
      return errorResponse(
        res,
        400,
        "Register this student's subjects for the selected session and term first",
      );
    }

    let registeredSubjectIds = registration.selected_subjects;
    if (!registeredSubjectIds) {
      const coreSubjectIds = await SubjectModel.find({
        organization,
        classes: studentRecord.academic_details.class,
        type: "core",
      }).distinct("_id");
      registeredSubjectIds = [
        ...coreSubjectIds,
        ...(registration.additional_subjects ?? []),
      ];
    }
    const registeredSubjects = new Set(
      registeredSubjectIds.map((subjectId) => String(subjectId)),
    );
    const submittedSubjectIds = blocks.map((block) => String(block.subject));
    const hasInvalidScores = blocks.some((block) => {
      const scores = [
        block.mid_term_test,
        block.ca_score,
        block.exam_score,
      ].map(Number);
      const calculatedTotal = scores.reduce((sum, score) => sum + score, 0);
      return (
        scores.some((score) => !Number.isFinite(score) || score < 0) ||
        calculatedTotal > 100 ||
        Number(block.total) !== calculatedTotal
      );
    });

    if (
      new Set(submittedSubjectIds).size !== submittedSubjectIds.length ||
      submittedSubjectIds.some(
        (subjectId) => !registeredSubjects.has(subjectId),
      ) ||
      hasInvalidScores
    ) {
      return errorResponse(
        res,
        400,
        "Results must contain unique registered subjects and valid scores",
      );
    }

    const existingResult = await ResultModel.exists({
      organization,
      student: studentRecord._id,
      session,
      term,
    });
    if (existingResult) {
      return errorResponse(
        res,
        409,
        "A result already exists for this student, session and term",
      );
    }

    const response = await AddResult({
      organization: account.organization_id,
      student: studentRecord._id,
      session,
      term,
      blocks: normalizedBlocks,
    });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getResultById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { result_id } = req.params;

    const response = await GetResultById(
      result_id,
      new ObjectId(account.organization_id),
    );

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateResultById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { result_id } = req.params;
    const { session, term, blocks, status } = req.body;

    const response = await UpdateResultById(
      result_id,
      new ObjectId(account.organization_id),
      { session, term, blocks, status },
    );
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteResultById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { result_id } = req.params;

    const response = await DeleteResultById(
      result_id,
      new ObjectId(account.organization_id),
    );
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addResultToResultBlock = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { result_id } = req.params;
    const { subject, mid_term_test, ca_score, exam_score, total, grade } =
      req.body;

    const response = await AddToResultBlock(
      result_id,
      new ObjectId(account.organization_id),
      { subject, mid_term_test, ca_score, exam_score, total, grade },
    );
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateResultInResultBlock = async (
  req: Request,
  res: Response,
) => {
  try {
    const { account } = req;
    const { result_id, block_id } = req.params;
    const { subject, mid_term_test, ca_score, exam_score, total, grade } =
      req.body;

    const response = await UpdateResultBlock(
      {
        _id: result_id,
        organization: new ObjectId(account.organization_id),
        "blocks._id": block_id,
      },
      { subject, mid_term_test, ca_score, exam_score, total, grade },
    );
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteResultFromResultBlock = async (
  req: Request,
  res: Response,
) => {
  try {
    const { account } = req;
    const { result_id, block_id } = req.params;

    const response = await DeleteResultBlock(
      result_id,
      new ObjectId(account.organization_id),
      block_id,
    );
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
