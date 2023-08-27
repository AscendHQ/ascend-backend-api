import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import { ObjectId } from "mongodb";
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

export const getAllResults = async (req: Request, res: Response) => {
  try {
    const {
      limit = 10,
      page = 1,
      session,
      term,
      subject_id,
      student_id,
    } = req.query;

    const query: ICustomInterface = {};

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

    // check if having access

    const response = await AddResult({
      organization: account.organization_id,
      student,
      session,
      term,
      blocks,
    });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getResultById = async (req: Request, res: Response) => {
  try {
    const { result_id } = req.params;

    // check if having access
    const response = await GetResultById(result_id);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateResultById = async (req: Request, res: Response) => {
  try {
    const { result_id } = req.params;
    const { session, term, blocks, status } = req.body;

    // check if having access

    const response = await UpdateResultById(result_id, {
      session,
      term,
      blocks,
      status,
    });
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteResultById = async (req: Request, res: Response) => {
  try {
    const { result_id } = req.params;

    // check if having access

    const response = await DeleteResultById(result_id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addResultToResultBlock = async (req: Request, res: Response) => {
  try {
    const { result_id } = req.params;
    const { subject, mid_term_test, ca_score, exam_score, total, grade } =
      req.body;

    // check if having access
    const response = await AddToResultBlock(result_id, {
      subject,
      mid_term_test,
      ca_score,
      exam_score,
      total,
      grade,
    });
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateResultInResultBlock = async (
  req: Request,
  res: Response
) => {
  try {
    const { result_id, block_id } = req.params;
    const { subject, mid_term_test, ca_score, exam_score, total, grade } =
      req.body;
    // check if having access
    const response = await UpdateResultBlock(
      { _id: result_id, "blocks._id": block_id },
      { subject, mid_term_test, ca_score, exam_score, total, grade }
    );
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteResultFromResultBlock = async (
  req: Request,
  res: Response
) => {
  try {
    const { result_id, block_id } = req.params;

    // check if having access
    const response = await DeleteResultBlock(result_id, block_id);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
