import { Request, Response } from "express";
import { AddHostel, GetAllHostel, FindOneHostel, FindByIdHostel, UpdateHostelById, DeleteHostelById } from "../services/hostel.services";
import {GetAccountById} from "../services/account.services";
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
    const { account } = req;
    const { account_id, organization_id } = account;

    // check if account exist
    const acc = await GetAccountById(account_id);
    if (!acc) return errorResponse(res, 404, "Account not found");

    // check if organization exist
    const org = await GetOrganizationById(organization_id);
    if (!org) return errorResponse(res, 404, "Organization not found");

    // check if hostel with organization id, exist already
    const hostel = await FindOneHostel({name: name, organization: organization_id});
    if (hostel) return errorResponse(res, 409, "Hostel already exist");

    // check if staff exist
    // const staffs = await FindStaffById(staff);

    //create hostel
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
    // // check if having access
    // const { account } = req;
    // const { account_id, organization_id } = account;
    // const { hostel_id } = req.params;

    // // check if account exist
    // const acc = await GetAccountById(account_id);
    // if (!acc) return errorResponse(res, 404, "Account not found");

    // // check if organization exist
    // const org = await GetOrganizationById(organization_id);
    // if (!org) return errorResponse(res, 404, "Organization not found");


    // // check if hostel exist
    // const hostel = await FindByIdHostel(hostel_id);
    // if (!hostel) return errorResponse(res, 404, "Hostel not found");

    // return successResponse(res, 200, hostel);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateHostelById = async (req: Request, res: Response) => {
  try {
    // // check if having access
    // const { account } = req;
    // const { account_id, organization_id } = account;
    // const { hostel_id } = req.params;

    // // check if account exist
    // const acc = await GetAccountById(account_id);
    // if (!acc) return errorResponse(res, 404, "Account not found");

    // // check if organization exist
    // const org = await GetOrganizationById(organization_id);
    // if (!org) return errorResponse(res, 404, "Organization not found");

    // // check if hostel exist
    // const hostel = await FindByIdHostel(hostel_id);
    // if (!hostel) return errorResponse(res, 404, "Hostel not found");

    // // update hostel
    // const response = await UpdateHostelById(hostel_id, req.body);
    // return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteHostelById = async (req: Request, res: Response) => {
  try {
    // // check if having access
    // const { account } = req;
    // const { account_id, organization_id } = account;
    // const { hostel_id } = req.params;

    // // check if account exist
    // const acc = await GetAccountById(account_id);
    // if (!acc) return errorResponse(res, 404, "Account not found");

    // // check if organization exist
    // const org = await GetOrganizationById(organization_id);
    // if (!org) return errorResponse(res, 404, "Organization not found");

    // // check if hostel exist
    // const hostel = await FindByIdHostel(hostel_id);
    // if (!hostel) return errorResponse(res, 404, "Hostel not found");

    // // delete hostel
    // const response = await DeleteHostelById(hostel_id);

    // return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addMembersToHostel = async (req: Request, res: Response) => {
  try {
    // // check member type, student or staff
    // // check if having access
    // const { account } = req;
    // const { account_id, organization_id } = account;
    // const { hostel_id } = req.params;

    // // check if account exist
    // const acc = await GetAccountById(account_id);
    // if (!acc) return errorResponse(res, 404, "Account not found");

    // // check if organization exist
    // const org = await GetOrganizationById(organization_id);
    // if (!org) return errorResponse(res, 404, "Organization not found");
  
    // // check if member exist
    // // check if member is a student


    // // check if member is already in a hostel
    // // check if hostel exist
    // // check if hostel is full
    // // add member to hostel

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
