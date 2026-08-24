import { Request, Response } from "express";
import { parse } from "csv-parse/sync";
import { ObjectId } from "mongodb";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { ICustomInterface } from "../interface";
import ClassModel from "../models/class";
import OrganizationModel from "../models/organization";
import StudentModel from "../models/student";
import {
  AddStudent,
  DeleteStudentById,
  GetAllStudents,
  UpdateStudentById,
  GetNextStudentNumber,
} from "../services/student.services";
import { UpdateOrganization } from "../services/organization.services";

const MAX_BULK_STUDENTS = 500;
const REQUIRED_BULK_HEADERS = ["first_name", "last_name", "class_name"];

type BulkStudentRow = Record<string, string>;
type BulkImportError = {
  row: number;
  field: string;
  message: string;
};

const cleanCell = (value: unknown) => String(value ?? "").trim();
const normalizeHeader = (value: string) =>
  cleanCell(value).toLowerCase().replace(/[\s-]+/g, "_");
const normalizeClassName = (value: string) => cleanCell(value).toLowerCase();

const incrementRegistrationNumber = (firstNumber: string, offset: number) => {
  if (offset === 0) return firstNumber;

  const match = firstNumber.match(/^(.*?)(\d+)$/);
  if (!match) return `${firstNumber}-${offset + 1}`;

  const nextNumber = String(Number(match[2]) + offset).padStart(
    match[2].length,
    "0",
  );
  return `${match[1]}${nextNumber}`;
};

const parseOptionalDate = (value: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isValidEmail = (value: string) =>
  !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const getAllStudents = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const {
      limit = 50,
      page = 1,
      name,
      registration_number,
      is_active,
      is_deleted,
    } = req.query;

    const query: ICustomInterface = {
      organization: account.organization_id,
      is_deleted: false,
    };

    const options: ICustomInterface = {
      limit: Number(limit),
      page: Number(page),
    };

    if (name) {
      const regexName = new RegExp(name as string, "i");
      query["$or"] = [
        { "personal_information.first_name": { $regex: regexName } },
        { "personal_information.last_name": { $regex: regexName } },
        { "personal_information.middle_name": { $regex: regexName } },
      ];
    }
    if (registration_number) query.registration_number = registration_number;
    if (is_active) query.is_active = is_active == "false" ? false : true;
    if (is_deleted) query.is_deleted = is_deleted == "false" ? false : true;

    const response = await GetAllStudents(query, options);
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const addStudent = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const {
      personal_information,
      contact_information,
      guardian_information,
      academic_details,
      accommodation,
      medical_information,
      additional_information,
    } = req.body;

    const registration_number = await GetNextStudentNumber(
      account.organization_id
    );

    const response = await AddStudent({
      organization: account.organization_id,
      registration_number,
      personal_information,
      contact_information,
      guardian_information,
      academic_details,
      accommodation,
      medical_information,
      additional_information,
    });

    await UpdateOrganization(account.organization_id, {
      last_student_id: response.registration_number,
    });

    return successResponse(res, 201, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const bulkAddStudent = async (req: Request, res: Response) => {
  try {
    const { account, file } = req;

    if (!file) {
      return errorResponse(res, 400, "Choose a CSV file to import");
    }

    let headers: string[] = [];
    let rows: BulkStudentRow[];
    try {
      rows = parse(file.buffer, {
        bom: true,
        columns: (values: string[]) => {
          headers = values.map(normalizeHeader);
          return headers;
        },
        skip_empty_lines: true,
        trim: true,
      }) as BulkStudentRow[];
    } catch {
      return errorResponse(res, 400, "The CSV file could not be read");
    }

    const missingHeaders = REQUIRED_BULK_HEADERS.filter(
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
      return errorResponse(res, 400, "The CSV file has no student rows");
    }
    if (rows.length > MAX_BULK_STUDENTS) {
      return errorResponse(
        res,
        400,
        `Import a maximum of ${MAX_BULK_STUDENTS} students at a time`,
      );
    }

    const organization = await OrganizationModel.findById(
      account.organization_id,
    ).select("academic_settings");
    const currentSession = organization?.academic_settings?.current_session;
    const currentTerm = organization?.academic_settings?.current_term;
    if (!currentSession || !currentTerm) {
      return errorResponse(
        res,
        400,
        "Set the current academic session and term before importing students",
      );
    }

    const classes = await ClassModel.find({
      organization: account.organization_id,
      is_active: true,
    })
      .select("_id name")
      .lean();
    const classByName = new Map(
      classes.map(item => [normalizeClassName(item.name), item._id]),
    );

    const firstGeneratedNumber = await GetNextStudentNumber(
      account.organization_id,
    );
    let generatedCount = 0;
    let lastGeneratedNumber = "";
    const errors: BulkImportError[] = [];
    const seenRegistrationNumbers = new Map<string, number>();
    const candidates: Array<{
      row: number;
      registrationNumber: string;
      student: Record<string, unknown>;
    }> = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      const firstName = cleanCell(row.first_name);
      const lastName = cleanCell(row.last_name);
      const className = cleanCell(row.class_name);
      const gender = cleanCell(row.gender).toLowerCase();
      const guardianEmail = cleanCell(row.guardian_email);
      const dob = parseOptionalDate(cleanCell(row.date_of_birth));
      const classId = classByName.get(normalizeClassName(className));

      if (!firstName) {
        errors.push({ row: rowNumber, field: "first_name", message: "First name is required" });
      }
      if (!lastName) {
        errors.push({ row: rowNumber, field: "last_name", message: "Last name is required" });
      }
      if (!className || !classId) {
        errors.push({
          row: rowNumber,
          field: "class_name",
          message: className ? `Class "${className}" was not found` : "Class name is required",
        });
      }
      if (gender && !["male", "female"].includes(gender)) {
        errors.push({ row: rowNumber, field: "gender", message: "Use male or female" });
      }
      if (dob === null) {
        errors.push({
          row: rowNumber,
          field: "date_of_birth",
          message: "Use a valid date such as 2012-09-24",
        });
      }
      if (!isValidEmail(guardianEmail)) {
        errors.push({
          row: rowNumber,
          field: "guardian_email",
          message: "Enter a valid guardian email",
        });
      }

      const suppliedNumber = cleanCell(row.registration_number);
      const registrationNumber =
        suppliedNumber ||
        incrementRegistrationNumber(firstGeneratedNumber, generatedCount++);
      if (!suppliedNumber) lastGeneratedNumber = registrationNumber;

      const previousRow = seenRegistrationNumbers.get(registrationNumber);
      if (previousRow) {
        errors.push({
          row: rowNumber,
          field: "registration_number",
          message: `Registration number duplicates row ${previousRow}`,
        });
      } else {
        seenRegistrationNumbers.set(registrationNumber, rowNumber);
      }

      candidates.push({
        row: rowNumber,
        registrationNumber,
        student: {
          organization: account.organization_id,
          registration_number: registrationNumber,
          personal_information: {
            first_name: firstName,
            middle_name: cleanCell(row.middle_name),
            last_name: lastName,
            gender: gender || undefined,
            dob: dob || undefined,
            religion: cleanCell(row.religion),
            nationality: cleanCell(row.nationality),
          },
          contact_information: {
            residential_address: cleanCell(row.address),
            contact_number: cleanCell(row.student_phone),
          },
          guardian_information: {
            first_name: cleanCell(row.guardian_first_name),
            last_name: cleanCell(row.guardian_last_name),
            relationship_with_student: cleanCell(row.guardian_relationship),
            contact_number: cleanCell(row.guardian_phone),
            email: guardianEmail,
          },
          academic_details: {
            class: classId,
            previous_school: cleanCell(row.previous_school),
            current_session: currentSession,
            current_term: currentTerm,
          },
          is_active: true,
          is_deleted: false,
        },
      });
    });

    const registrationNumbers = candidates.map(item => item.registrationNumber);
    const existingStudents = await StudentModel.find({
      registration_number: { $in: registrationNumbers },
    })
      .select("registration_number")
      .lean();
    const existingNumbers = new Set(
      existingStudents.map(item => item.registration_number),
    );
    candidates.forEach(candidate => {
      if (existingNumbers.has(candidate.registrationNumber)) {
        errors.push({
          row: candidate.row,
          field: "registration_number",
          message: "Registration number already exists",
        });
      }
    });

    if (errors.length > 0) {
      return errorResponse(res, 400, {
        message: "Fix the listed rows and upload the file again",
        errors,
      });
    }

    await StudentModel.insertMany(candidates.map(item => item.student));
    if (lastGeneratedNumber) {
      await UpdateOrganization(account.organization_id, {
        last_student_id: lastGeneratedNumber,
      });
    }

    return successResponse(res, 201, {
      imported: candidates.length,
      message: `${candidates.length} students imported successfully`,
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateStudentById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { student_id } = req.params;
    const {
      personal_information,
      contact_information,
      guardian_information,
      academic_details,
      accommodation,
      medical_information,
      additional_information,
      is_active,
    } = req.body;

    const response = await UpdateStudentById(
      student_id,
      new ObjectId(account.organization_id),
      {
        personal_information,
        contact_information,
        guardian_information,
        academic_details,
        accommodation,
        medical_information,
        additional_information,
        is_active,
      }
    );

    if (!response) {
      return errorResponse(res, 404, "Student not found");
    }

    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const deleteStudentById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { student_id } = req.params;

    const response = await DeleteStudentById(
      student_id,
      new ObjectId(account.organization_id)
    );
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
