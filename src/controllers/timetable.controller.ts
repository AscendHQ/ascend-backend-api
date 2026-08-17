import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import ClassModel from "../models/class";
import StudentModel from "../models/student";
import TimetableModel from "../models/timetable";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { getAccessibleStudentIds } from "../utils/portalAccess";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const ENTRY_TYPES = ["lesson", "break", "assembly", "activity"];
const VALID_TERMS = ["1st Term", "2nd Term", "3rd Term"];

const validateEntries = (entries: unknown) => {
  if (!Array.isArray(entries) || entries.length === 0) return null;
  const valid = entries.every(
    (entry) =>
      DAYS.includes(entry.day) &&
      /^([01]\d|2[0-3]):[0-5]\d$/.test(entry.start_time) &&
      /^([01]\d|2[0-3]):[0-5]\d$/.test(entry.end_time) &&
      entry.start_time < entry.end_time &&
      typeof entry.subject === "string" &&
      entry.subject.trim() &&
      entry.subject.trim().length <= 100 &&
      ENTRY_TYPES.includes(entry.type),
  );
  return valid
    ? entries.map((entry) => ({
        day: entry.day,
        start_time: entry.start_time,
        end_time: entry.end_time,
        subject: entry.subject.trim(),
        teacher: typeof entry.teacher === "string" ? entry.teacher.trim() : "",
        room: typeof entry.room === "string" ? entry.room.trim() : "",
        type: entry.type,
      }))
    : null;
};

export const getTimetables = async (req: Request, res: Response) => {
  try {
    const { class_id, session, term } = req.query;
    const query: Record<string, unknown> = {
      organization: new ObjectId(req.account.organization_id),
    };
    if (class_id && ObjectId.isValid(class_id as string)) query.class = new ObjectId(class_id as string);
    if (session) query.session = session;
    if (term) query.term = term;
    const timetables = await TimetableModel.find(query)
      .populate({ path: "class", select: "name level section other_section" })
      .sort({ updatedAt: -1 });
    return successResponse(res, 200, timetables);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const saveTimetable = async (req: Request, res: Response) => {
  try {
    const { class_id, session, term, entries } = req.body;
    const normalizedEntries = validateEntries(entries);
    if (
      !ObjectId.isValid(class_id) ||
      typeof session !== "string" ||
      !/^\d{4}\/\d{4}$/.test(session) ||
      !VALID_TERMS.includes(term) ||
      !normalizedEntries
    ) {
      return errorResponse(res, 400, "Valid timetable details are required");
    }
    const organization = new ObjectId(req.account.organization_id);
    const classObjectId = new ObjectId(class_id);
    const classRecord = await ClassModel.exists({ _id: classObjectId, organization, is_active: true });
    if (!classRecord) return errorResponse(res, 404, "Class not found");
    const timetable = await TimetableModel.findOneAndUpdate(
      { organization, class: classObjectId, session, term },
      { $set: { entries: normalizedEntries, updated_by: new ObjectId(req.account.account_id) } },
      { new: true, upsert: true, runValidators: true },
    );
    return successResponse(res, 200, timetable);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getPortalTimetable = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;
    if (!ObjectId.isValid(student_id)) return errorResponse(res, 400, "Invalid student");
    const accessibleIds = await getAccessibleStudentIds(req.account);
    if (!accessibleIds.some((studentId) => String(studentId) === student_id)) {
      return errorResponse(res, 403, "You do not have access to this timetable");
    }
    const organization = new ObjectId(req.account.organization_id);
    const student = await StudentModel.findOne({
      _id: new ObjectId(student_id),
      organization,
      is_deleted: false,
    }).select("academic_details");
    if (!student?.academic_details.class) return errorResponse(res, 404, "Student class not found");
    const session = (req.query.session as string) || student.academic_details.current_session;
    const term = (req.query.term as string) || student.academic_details.current_term;
    const timetable = await TimetableModel.findOne({
      organization,
      class: student.academic_details.class,
      session,
      term,
    }).populate({ path: "class", select: "name level section other_section" });
    return successResponse(res, 200, timetable);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
