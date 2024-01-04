import { Request, Response } from "express";
import { parse } from "csv-parse/sync";
import {
  AddHostel,
  GetAllHostel,
  GetOneHostel,
  GetHostelById,
  UpdateHostelById,
  DeleteHostelById,
  BulkAddHostel,
} from "../services/hostel.services";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import { UpdateStudentById } from "../services/student.services";

export const getAllHostel = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { limit = 10, page = 1, name, staff_name, is_active } = req.query;

    const query: ICustomInterface = {
      organization: account.organization_id,
      is_active: true,
    };
    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (name) query.name = { $regex: new RegExp(name as string, "i") };
    if (staff_name)
      query.staff_name = { $regex: new RegExp(staff_name as string, "i") };
    if (is_active) query.is_active = is_active == "false" ? false : true;

    const response = await GetAllHostel(query, options);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addHostel = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const {
      name,
      capacity,
      gender_type,
      room_type,
      available_amenities,
      staff_name,
      staff_contact_number,
      other_notes,
      students,
      room_naming_convention,
      room_fee,
      room_fee_payment_period,
    } = req.body;

    const hostel = await GetOneHostel({
      name: name,
      organization: account.organization_id,
    });

    if (hostel) return errorResponse(res, 409, "Hostel already exist");

    const response = await AddHostel({
      organization: account.organization_id,
      name,
      capacity,
      gender_type,
      room_type,
      available_amenities,
      staff_name,
      staff_contact_number,
      other_notes,
      students,
      room_naming_convention,
      room_fee,
      room_fee_payment_period,
    });

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const bulkAddHostel = async (req: Request, res: Response) => {
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

    const hostels = data.map((each_hostel: any) => ({
      organization: account.organization_id,
      name: each_hostel[0],
      capacity: parseInt(each_hostel[1]),
      gender_type: each_hostel[2],
      room_type: each_hostel[3],
      staff_name: each_hostel[4],
      staff_contact_number: each_hostel[5],
      room_naming_convention: each_hostel[6],
      room_fee: parseFloat(each_hostel[7]),
      room_fee_payment_period: each_hostel[8],
      available_amenities: each_hostel[9].split(",").map((amenity: string) => ({
        item: amenity.trim(),
        is_available: true,
      })),
    }));

    const response = await BulkAddHostel(hostels);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getHostelById = async (req: Request, res: Response) => {
  try {
    const { hostel_id } = req.params;

    const hostel = await GetHostelById(hostel_id);

    return successResponse(res, 200, hostel);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateHostelById = async (req: Request, res: Response) => {
  try {
    const { hostel_id } = req.params;
    const {
      name,
      capacity,
      gender_type,
      room_type,
      available_amenities,
      staff_name,
      staff_contact_number,
      other_notes,
      students,
      room_naming_convention,
      room_fee,
      room_fee_payment_period,
    } = req.body;

    const response = await UpdateHostelById(hostel_id, {
      name,
      capacity,
      gender_type,
      room_type,
      available_amenities,
      staff_name,
      staff_contact_number,
      other_notes,
      students,
      room_naming_convention,
      room_fee,
      room_fee_payment_period,
    });

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteHostelById = async (req: Request, res: Response) => {
  try {
    const { hostel_id } = req.params;

    const response = await DeleteHostelById(hostel_id);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
