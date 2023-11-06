import { Request, Response, response } from "express";
import { ObjectId } from "mongodb";
import {
  AddHostel,
  GetAllHostel,
  FindOneHostel,
  FindByIdHostel,
  UpdateHostelById,
  DeleteHostelById,
} from "../services/hostel.services";
import { GetAccountById } from "../services/account.services";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import { GetOrganizationById } from "../services/organization.services";
import { GetStudentById } from "../services/student.services";
import { GetStaffById } from "../services/staff.services";
import mongoose from "mongoose";

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
    console.log(req);
    const {
      name,
      staff,
      capacity,
      number_of_student,
      students,
      gender,
      room_type,
      available_amenities,
      other_notes,
      room_naming_convention,
      room_fee,
      room_fee_payment_period,
    } = req.body;

    const { account } = req;
    const { account_id, organization_id } = account;

    const acc = await GetAccountById(account_id);
    if (!acc) return errorResponse(res, 404, "Account not found");

    const org = await GetOrganizationById(organization_id);
    if (!org) return errorResponse(res, 404, "Organization not found");

    const hostel = await FindOneHostel({
      name: name,
      organization: organization_id,
    });
    if (hostel) return errorResponse(res, 409, "Hostel already exist");

    // check if staff exist
    const staffs = await GetStaffById(staff, new ObjectId(organization_id));
    if (!staffs) return errorResponse(res, 404, "Staff not found");

    // check if student exist
    const student = await GetStudentById(students);
    if (!student) return errorResponse(res, 404, "Student not found");

    if (student.hostel?.hostel_id == hostel)
      return errorResponse(res, 404, "Student already in this hostel");

    //create hostel
    const response = await AddHostel({
      name,
      organization: organization_id,
      staff,
      capacity,
      students: students,
      number_of_students: number_of_student,
      gender,
      room_type,
      available_amenities,
      other_notes,
      room_naming_convention,
      room_fee,
      room_fee_payment_period,
      is_active: true,
    });
    student.hostel?.hostel_id == response;
    await student.save();
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getHostelById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { account_id, organization_id } = account;
    const { hostel_id } = req.params;

    const acc = await GetAccountById(account_id);
    if (!acc) return errorResponse(res, 404, "Account not found");

    const org = await GetOrganizationById(organization_id);
    if (!org) return errorResponse(res, 404, "Organization not found");

    const hostel = await FindByIdHostel(hostel_id);
    if (!hostel) return errorResponse(res, 404, "Hostel not found");

    return successResponse(res, 200, hostel);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateHostelById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { account_id, organization_id } = account;
    const { hostel_id } = req.params;

    const acc = await GetAccountById(account_id);
    if (!acc) return errorResponse(res, 404, "Account not found");

    const org = await GetOrganizationById(organization_id);
    if (!org) return errorResponse(res, 404, "Organization not found");

    const hostel = await FindByIdHostel(hostel_id);
    if (!hostel) return errorResponse(res, 404, "Hostel not found");

    const response = await UpdateHostelById(hostel_id, req.body);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteHostelById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { account_id, organization_id } = account;
    const { hostel_id } = req.params;

    const acc = await GetAccountById(account_id);
    if (!acc) return errorResponse(res, 404, "Account not found");

    const org = await GetOrganizationById(organization_id);
    if (!org) return errorResponse(res, 404, "Organization not found");

    const hostel = await FindByIdHostel(hostel_id);
    if (!hostel) return errorResponse(res, 404, "Hostel not found");

    const response = await DeleteHostelById(hostel_id);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addMembersToHostel = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { account_id, organization_id } = account;
    const { member_id } = req.body;
    const { hostel_id } = req.params;

    const acc = await GetAccountById(account_id);
    if (!acc) return errorResponse(res, 404, "Account not found");

    const org = await GetOrganizationById(organization_id);
    if (!org) return errorResponse(res, 404, "Organization not found");

    const student = await GetStudentById(member_id);
    if (!student) return errorResponse(res, 404, "Student not found");

    if (student.hostel?.hostel_id == hostel_id)
      return errorResponse(res, 404, "Student already in this hostel");

    const hostel = await FindByIdHostel(hostel_id);
    if (!hostel) return errorResponse(res, 404, "Hostel not found");

    if (hostel.number_of_students >= hostel.capacity)
      return errorResponse(res, 404, "Hostel is full");

    // check if student is already in a hostel
    for (const studen of hostel.students) {
      if (studen.toString() == student._id.toString()) {
        return errorResponse(res, 404, "Student already in this hostel");
      }
    }
    hostel.students?.push(member_id);
    hostel.number_of_students = hostel.number_of_students + 1;
    await hostel.save();

    const response = await UpdateHostelById(hostel_id, hostel);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getAllStudentsInAnHostel = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { account_id, organization_id } = account;
    const { hostel_id } = req.params;

    const acc = await GetAccountById(account_id);
    if (!acc) return errorResponse(res, 404, "Account not found");

    const org = await GetOrganizationById(organization_id);
    if (!org) return errorResponse(res, 404, "Organization not found");

    const response = await FindByIdHostel(hostel_id);
    if (!response) return errorResponse(res, 404, "Hostel not found");

    return successResponse(res, 200, response.students);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateStudentHostel = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { account_id, organization_id } = account;

    const { hostel_id, student_id } = req.params;

    const acc = await GetAccountById(account_id);
    if (!acc) return errorResponse(res, 404, "Account not found");

    const org = await GetOrganizationById(organization_id);
    if (!org) return errorResponse(res, 404, "Organization not found");

    const student = await GetStudentById(student_id);
    if (!student) return errorResponse(res, 404, "Student not found");

    const hostel = await FindByIdHostel(hostel_id);
    if (!hostel) return errorResponse(res, 404, "Hostel not found");

    student.hostel?.hostel_id == hostel_id;
    await student.save();

    return successResponse(res, 200, student);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const removeStudentFromHostel = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { account_id, organization_id } = account;

    const { hostel_id, student_id } = req.params;

    const acc = await GetAccountById(account_id);
    if (!acc) return errorResponse(res, 404, "Account not found");

    const org = await GetOrganizationById(organization_id);
    if (!org) return errorResponse(res, 404, "Organization not found");

    const student = await GetStudentById(student_id);
    if (!student) return errorResponse(res, 404, "Student not found");

    const hostel = await FindByIdHostel(hostel_id);
    if (!hostel) return errorResponse(res, 404, "Hostel not found");

    student.hostel?.hostel_id == null;
    await student.save();

    for (let i = 0; i < hostel.students.length; i++) {
      if (hostel.students[i].toString() == student_id.toString()) {
        await UpdateHostelById(hostel_id, { $pull: { students: student_id } });
        hostel.number_of_students = hostel.number_of_students - 1;
        await hostel.save();
      }
    }

    return successResponse(res, 200, hostel);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
