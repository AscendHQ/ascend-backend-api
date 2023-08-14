import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";

export const getAllHostel = async (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addHostel = async (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getHostelById = async (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateHostelById = async (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteHostelById = async (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addMembersToHostel = async (req: Request, res: Response) => {
  try {
    // check member type, student or staff
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getAllStudentsInAnHostel = async (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateStudentHostel = async (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const removeStudentFromHostel = async (req: Request, res: Response) => {
  try {
    return successResponse(res, 200);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
