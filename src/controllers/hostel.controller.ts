import { Request, Response } from "express";
import { AddHostel, GetAllHostel, FindOneHostel, FindByIdHostel } from "../services/hostel.services";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import { GetOrganizationById } from "../services/organization.services";

export const getAllHostel = async (req: Request, res: Response) => {
  try {
    const { limit = 10, page = 1, name } = req.query;

    const query: ICustomInterface = {};
    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (name) query.name = { $regex: new RegExp(name as string, "i") };

    const response = await GetAllHostel(query, options);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addHostel = async (req: Request, res: Response) => {
  try {
    const { 
      name,  
      staff, 
      capacity, 
      number_of_student, 
      gender, room_type, 
      available_amenities, 
      other_notes, 
      room_naming_convention, 
      room_fee, 
      room_fee_payment_period
    } = req.body;
    
    // check if having access
    const {  organization_id } = req.account;

    // check if organization exist
    const org = await GetOrganizationById(organization_id);
    if (!org) return errorResponse(res, 404, "Organization not found");

    // check if hostel exist
    const hostel = await FindOneHostel(name);
    if (hostel) return errorResponse(res, 409, "Hostel already exist");

    // check if staff exist

    // create hostel
    const response = await AddHostel({
      name, 
      organization: organization_id, 
      staff, 
      capacity, 
      number_of_students: number_of_student, 
      gender, room_type, 
      available_amenities, 
      other_notes, 
      room_naming_convention, 
      room_fee, 
      room_fee_payment_period,
      is_active: true
    });

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getHostelById = async (req: Request, res: Response) => {
  try {
    // check if having access

    // check if hostel exist
    const { hostel_id } = req.params;
    
    const hostel = await FindByIdHostel(hostel_id);
    if (!hostel) return errorResponse(res, 404, "Hostel not found");

    return successResponse(res, 200, hostel);
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
