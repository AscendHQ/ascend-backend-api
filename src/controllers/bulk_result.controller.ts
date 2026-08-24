import { parse } from "csv-parse/sync";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import { EStatus } from "../interface";
import ClassModel from "../models/class";
import ResultModel from "../models/result";
import SubjectModel from "../models/subject";
import {
  getRegisteredStudents,
  saveTeacherResultRegister,
} from "./teacher_result.controller";
import { errorResponse, successResponse } from "../utils/responseHandler";

const VALID_TERMS = ["1st Term", "2nd Term", "3rd Term"];
const HEADERS = [
  "registration_number",
  "student_name",
  "mid_term_test",
  "ca_score",
  "exam_score",
];

type ImportError = { row: number; field: string; message: string };
type ScoreRecord = {
  student: string;
  mid_term_test: number;
  ca_score: number;
  exam_score: number;
};

const getKey = (source: Record<string, unknown>) => ({
  class_id: String(source.class_id ?? ""),
  subject_id: String(source.subject_id ?? ""),
  session: String(source.session ?? ""),
  term: String(source.term ?? ""),
});

const isValidKey = (key: ReturnType<typeof getKey>) =>
  ObjectId.isValid(key.class_id) &&
  ObjectId.isValid(key.subject_id) &&
  /^\d{4}\/\d{4}$/.test(key.session) &&
  VALID_TERMS.includes(key.term);

const studentName = (student: any) =>
  [
    student.personal_information?.last_name,
    student.personal_information?.first_name,
    student.personal_information?.middle_name,
  ]
    .filter(Boolean)
    .join(" ");

const parseRows = (file?: Express.Multer.File) => {
  if (!file) return { rows: [], errors: [{ row: 0, field: "csv", message: "Choose a CSV file" }] };
  try {
    const rows = parse(file.buffer, {
      columns: (headers: string[]) => headers.map((header) => header.trim()),
      bom: true,
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];
    const headers = rows.length ? Object.keys(rows[0]) : [];
    const missing = HEADERS.filter((header) => !headers.includes(header));
    if (missing.length) {
      return {
        rows: [],
        errors: missing.map((field) => ({
          row: 1,
          field,
          message: "Required column is missing",
        })),
      };
    }
    return { rows, errors: [] as ImportError[] };
  } catch (error: any) {
    return {
      rows: [],
      errors: [{ row: 0, field: "csv", message: error.message }],
    };
  }
};

const validateRows = (rows: Record<string, string>[], students: any[]) => {
  const errors: ImportError[] = [];
  const roster = new Map(
    students.map((student) => [student.registration_number.toLowerCase(), student]),
  );
  const seen = new Set<string>();
  const records: ScoreRecord[] = [];
  rows.forEach((row, index) => {
    const csvRow = index + 2;
    const registrationNumber = String(row.registration_number ?? "").trim();
    const normalizedNumber = registrationNumber.toLowerCase();
    const student = roster.get(normalizedNumber);
    if (!registrationNumber) {
      errors.push({ row: csvRow, field: "registration_number", message: "Registration number is required" });
    } else if (seen.has(normalizedNumber)) {
      errors.push({ row: csvRow, field: "registration_number", message: "Student appears more than once" });
    } else if (!student) {
      errors.push({ row: csvRow, field: "registration_number", message: "Student is not in this subject roster" });
    }
    seen.add(normalizedNumber);
    const values = ["mid_term_test", "ca_score", "exam_score"].map((field) => {
      const raw = String(row[field] ?? "").trim();
      const value = Number(raw);
      if (!raw || !Number.isFinite(value) || value < 0) {
        errors.push({ row: csvRow, field, message: "Enter a non-negative number" });
      }
      return value;
    });
    const total = values.reduce((sum, value) => sum + value, 0);
    if (Number.isFinite(total) && total > 100) {
      errors.push({ row: csvRow, field: "total", message: "Combined score cannot exceed 100" });
    }
    if (student && values.every(Number.isFinite) && values.every((value) => value >= 0) && total <= 100) {
      records.push({
        student: String(student._id),
        mid_term_test: values[0],
        ca_score: values[1],
        exam_score: values[2],
      });
    }
  });
  students.forEach((student) => {
    if (!seen.has(student.registration_number.toLowerCase())) {
      errors.push({
        row: 0,
        field: "registration_number",
        message: `${student.registration_number} (${studentName(student)}) is missing`,
      });
    }
  });
  return { records, errors };
};

const loadRoster = async (req: Request, source: Record<string, unknown>) => {
  const key = getKey(source);
  if (!isValidKey(key)) return { key, students: null };
  const organization = new ObjectId(req.account.organization_id);
  const students = await getRegisteredStudents({
    organization,
    classId: new ObjectId(key.class_id),
    subjectId: new ObjectId(key.subject_id),
    session: key.session,
    term: key.term,
  });
  return { key, students };
};

export const getAdminBulkResultRoster = async (req: Request, res: Response) => {
  try {
    const { key, students } = await loadRoster(req, req.query as Record<string, unknown>);
    if (!isValidKey(key)) return errorResponse(res, 400, "Class, subject, session, and term are required");
    if (!students) return errorResponse(res, 404, "Class subject was not found");
    const [classRecord, subject] = await Promise.all([
      ClassModel.findById(key.class_id).select("name level section other_section"),
      SubjectModel.findById(key.subject_id).select("name code type"),
    ]);
    return successResponse(res, 200, {
      class: classRecord,
      subject,
      session: key.session,
      term: key.term,
      students: students.map((student) => ({
        _id: student._id,
        registration_number: student.registration_number,
        personal_information: student.personal_information,
      })),
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

const grade = (total: number) => {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 40) return "D";
  return "F";
};

const saveOfficialRecords = async (
  organization: ObjectId,
  subject: ObjectId,
  session: string,
  term: string,
  records: ScoreRecord[],
) => {
  await Promise.all(records.map(async (record) => {
    let result = await ResultModel.findOne({ organization, student: record.student, session, term });
    if (!result) {
      result = new ResultModel({ organization, student: record.student, session, term, blocks: [] });
    }
    const total = record.mid_term_test + record.ca_score + record.exam_score;
    const values = { subject, ...record, student: undefined, total, grade: grade(total) } as any;
    delete values.student;
    const block = result.blocks.find((item) => String(item.subject) === String(subject));
    if (block) Object.assign(block, values);
    else result.blocks.push(values);
    result.status = EStatus.APPROVED;
    await result.save();
  }));
};

export const uploadAdminBulkResults = async (req: Request, res: Response) => {
  try {
    const { key, students } = await loadRoster(req, req.body);
    if (!isValidKey(key)) return errorResponse(res, 400, "Class, subject, session, and term are required");
    if (!students) return errorResponse(res, 404, "Class subject was not found");
    const parsed = parseRows(req.file);
    const checked = parsed.errors.length ? { records: [], errors: parsed.errors } : validateRows(parsed.rows, students);
    if (checked.errors.length) {
      return errorResponse(res, 400, { message: "Fix the CSV errors and upload again", errors: checked.errors });
    }
    await saveOfficialRecords(
      new ObjectId(req.account.organization_id),
      new ObjectId(key.subject_id),
      key.session,
      key.term,
      checked.records,
    );
    return successResponse(res, 200, { imported: checked.records.length, message: `${checked.records.length} student results saved` });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const uploadTeacherBulkResults = async (req: Request, res: Response) => {
  try {
    const { key, students } = await loadRoster(req, req.body);
    if (!isValidKey(key)) return errorResponse(res, 400, "Class, subject, session, and term are required");
    if (!students) return errorResponse(res, 404, "Assigned class subject was not found");
    const parsed = parseRows(req.file);
    const checked = parsed.errors.length ? { records: [], errors: parsed.errors } : validateRows(parsed.rows, students);
    if (checked.errors.length) {
      return errorResponse(res, 400, { message: "Fix the CSV errors and upload again", errors: checked.errors });
    }
    req.body = { ...key, action: req.body.action, records: checked.records };
    return saveTeacherResultRegister(req, res);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
