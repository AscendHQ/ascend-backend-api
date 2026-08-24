import { parse } from "csv-parse/sync";
import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/responseHandler";
import {
  AddStaff,
  DeleteStaffById,
  GetAllStaff,
  GetNextStaffNumber,
  GetStaffById,
  UpdateStaffById,
} from "../services/staff.services";
import { ICustomInterface } from "../interface";
import { ObjectId } from "mongodb";
import { UpdateOrganization } from "../services/organization.services";
import StaffModel from "../models/staff";

const MAX_BULK_STAFF = 500;
const STAFF_REQUIRED_HEADERS = [
  "surname",
  "other_names",
  "sex",
  "status",
  "employment_type",
  "denomination",
  "department",
  "post",
  "address",
  "phone_number",
];

type BulkStaffRow = Record<string, string>;
type BulkStaffError = { row: number; field: string; message: string };

const cleanStaffCell = (value: unknown) => String(value ?? "").trim();
const normalizeStaffHeader = (value: string) =>
  cleanStaffCell(value).toLowerCase().replace(/[\s-]+/g, "_");
const incrementStaffNumber = (firstNumber: string, offset: number) => {
  if (offset === 0) return firstNumber;
  const match = firstNumber.match(/^(.*?)(\d+)$/);
  if (!match) return `${firstNumber}-${offset + 1}`;
  return `${match[1]}${String(Number(match[2]) + offset).padStart(
    match[2].length,
    "0",
  )}`;
};
const parseStaffDate = (value: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { limit = 100, page = 1, staff_no, status, type } = req.query;

    const query: ICustomInterface = {
      organization: new ObjectId(account.organization_id),
    };

    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (staff_no) query.staff_no = staff_no;
    if (status) query.status = status;
    if (type) query.type = type;

    const response = await GetAllStaff(query, options);

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getNextStaffNumber = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { staff_no } = req.query;

    const response = await GetNextStaffNumber(
      account.organization_id,
      staff_no as string
    );

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addStaff = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const {
      staff_no,
      surname,
      other_names,
      sex,
      status,
      type,
      denomination,
      department,
      qualifications,
      post,
      address,
      phone_number,
      loan_received,
      loan_refunded,
      loan_debt,
      employment_date,
      exit_date,
      exit_reason,
    } = req.body;

    const response = await AddStaff({
      organization: account.organization_id,
      staff_no,
      surname,
      other_names,
      sex,
      status,
      type,
      denomination,
      department,
      qualifications,
      post,
      address,
      phone_number,
      loan_received,
      loan_refunded,
      loan_debt,
      employment_date,
      exit_date,
      exit_reason,
    });

    UpdateOrganization(account.organization_id, { last_staff_id: staff_no });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const bulkAddStaff = async (req: Request, res: Response) => {
  try {
    const { account, file } = req;
    if (!file) return errorResponse(res, 400, "Choose a CSV file to import");

    let headers: string[] = [];
    let rows: BulkStaffRow[];
    try {
      rows = parse(file.buffer, {
        bom: true,
        columns: (values: string[]) => {
          headers = values.map(normalizeStaffHeader);
          return headers;
        },
        skip_empty_lines: true,
        trim: true,
      }) as BulkStaffRow[];
    } catch {
      return errorResponse(res, 400, "The CSV file could not be read");
    }

    const missingHeaders = STAFF_REQUIRED_HEADERS.filter(
      header => !headers.includes(header),
    );
    if (missingHeaders.length > 0) {
      return errorResponse(res, 400, {
        message: "The CSV template is missing required columns",
        errors: missingHeaders.map(field => ({
          row: 1,
          field,
          message: `Missing column: ${field}`,
        })),
      });
    }
    if (rows.length === 0) {
      return errorResponse(res, 400, "The CSV file has no staff rows");
    }
    if (rows.length > MAX_BULK_STAFF) {
      return errorResponse(
        res,
        400,
        `Import a maximum of ${MAX_BULK_STAFF} staff at a time`,
      );
    }

    const firstGeneratedNumber = await GetNextStaffNumber(
      account.organization_id,
    );
    let generatedCount = 0;
    let lastGeneratedNumber = "";
    const errors: BulkStaffError[] = [];
    const seenNumbers = new Map<string, number>();
    const candidates: Array<{
      row: number;
      staffNumber: string;
      staff: Record<string, unknown>;
    }> = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      const values = {
        surname: cleanStaffCell(row.surname),
        otherNames: cleanStaffCell(row.other_names),
        sex: cleanStaffCell(row.sex).toLowerCase(),
        status: cleanStaffCell(row.status).toLowerCase().replace(/-/g, "_"),
        type: cleanStaffCell(row.employment_type)
          .toLowerCase()
          .replace(/-/g, "_"),
        denomination: cleanStaffCell(row.denomination)
          .toLowerCase()
          .replace(/-/g, "_"),
        department: cleanStaffCell(row.department),
        post: cleanStaffCell(row.post),
        address: cleanStaffCell(row.address),
        phoneNumber: cleanStaffCell(row.phone_number),
      };
      const requiredValues: Array<[string, string]> = [
        ["surname", values.surname],
        ["other_names", values.otherNames],
        ["department", values.department],
        ["post", values.post],
        ["address", values.address],
        ["phone_number", values.phoneNumber],
      ];
      requiredValues.forEach(([field, value]) => {
        if (!value) errors.push({ row: rowNumber, field, message: "Required" });
      });
      if (!["male", "female"].includes(values.sex)) {
        errors.push({ row: rowNumber, field: "sex", message: "Use male or female" });
      }
      if (!["teaching", "none_teaching"].includes(values.status)) {
        errors.push({
          row: rowNumber,
          field: "status",
          message: "Use teaching or none_teaching",
        });
      }
      if (!["permanent", "part_time"].includes(values.type)) {
        errors.push({
          row: rowNumber,
          field: "employment_type",
          message: "Use permanent or part_time",
        });
      }
      if (!["islam", "adventist", "non_adventist"].includes(values.denomination)) {
        errors.push({
          row: rowNumber,
          field: "denomination",
          message: "Use islam, adventist or non_adventist",
        });
      }

      const employmentDate = parseStaffDate(
        cleanStaffCell(row.employment_date),
      );
      if (employmentDate === null) {
        errors.push({
          row: rowNumber,
          field: "employment_date",
          message: "Use a valid date such as 2026-09-01",
        });
      }

      const suppliedNumber = cleanStaffCell(row.staff_number);
      const staffNumber =
        suppliedNumber ||
        incrementStaffNumber(firstGeneratedNumber, generatedCount++);
      if (!suppliedNumber) lastGeneratedNumber = staffNumber;
      const previousRow = seenNumbers.get(staffNumber);
      if (previousRow) {
        errors.push({
          row: rowNumber,
          field: "staff_number",
          message: `Staff number duplicates row ${previousRow}`,
        });
      } else {
        seenNumbers.set(staffNumber, rowNumber);
      }

      candidates.push({
        row: rowNumber,
        staffNumber,
        staff: {
          organization: account.organization_id,
          staff_no: staffNumber,
          surname: values.surname,
          other_names: values.otherNames,
          sex: values.sex,
          status: values.status,
          type: values.type,
          denomination: values.denomination,
          department: values.department,
          qualifications: cleanStaffCell(row.qualifications)
            .split(/[;|]/)
            .map(item => item.trim())
            .filter(Boolean),
          post: values.post,
          address: values.address,
          phone_number: values.phoneNumber,
          employment_date: employmentDate || undefined,
          loan_received: 0,
          loan_refunded: 0,
          loan_debt: 0,
        },
      });
    });

    const existingStaff = await StaffModel.find({
      staff_no: { $in: candidates.map(item => item.staffNumber) },
    })
      .select("staff_no")
      .lean();
    const existingNumbers = new Set(existingStaff.map(item => item.staff_no));
    candidates.forEach(candidate => {
      if (existingNumbers.has(candidate.staffNumber)) {
        errors.push({
          row: candidate.row,
          field: "staff_number",
          message: "Staff number already exists",
        });
      }
    });

    if (errors.length > 0) {
      return errorResponse(res, 400, {
        message: "Fix the listed rows and upload the file again",
        errors,
      });
    }

    await StaffModel.insertMany(candidates.map(item => item.staff));
    if (lastGeneratedNumber) {
      await UpdateOrganization(account.organization_id, {
        last_staff_id: lastGeneratedNumber,
      });
    }

    return successResponse(res, 201, {
      imported: candidates.length,
      message: `${candidates.length} staff imported successfully`,
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getStaffById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { staff_no } = req.params;

    const response = await GetStaffById(
      staff_no,
      new ObjectId(account.organization_id)
    );
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateStaffById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { staff_no } = req.params;
    const {
      surname,
      other_names,
      sex,
      status,
      type,
      denomination,
      department,
      qualifications,
      post,
      address,
      phone_number,
      loan_received,
      loan_refunded,
      loan_debt,
      employment_date,
      exit_date,
      exit_reason,
    } = req.body;

    const query = {
      staff_no,
      organization: new ObjectId(account.organization_id),
    };

    const response = await UpdateStaffById(query, {
      surname,
      other_names,
      sex,
      status,
      type,
      denomination,
      department,
      qualifications,
      post,
      address,
      phone_number,
      loan_received,
      loan_refunded,
      loan_debt,
      employment_date,
      exit_date,
      exit_reason,
    });

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteStaffById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { staff_no } = req.params;

    const response = await DeleteStaffById(
      staff_no,
      new ObjectId(account.organization_id)
    );
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
