import { ObjectId } from "mongodb";
import { Request, Response } from "express";

import { EAttendanceStatus } from "../interface";
import AttendanceModel from "../models/attendance";
import ClassModel from "../models/class";
import StudentModel from "../models/student";
import { errorResponse, successResponse } from "../utils/responseHandler";

const VALID_TERMS = ["1st Term", "2nd Term", "3rd Term"];
const VALID_STATUSES = Object.values(EAttendanceStatus);

const isValidRegisterKey = ({
  classId,
  session,
  term,
  date,
}: {
  classId: unknown;
  session: unknown;
  term: unknown;
  date: unknown;
}) =>
  typeof classId === "string" &&
  ObjectId.isValid(classId) &&
  typeof session === "string" &&
  /^\d{4}\/\d{4}$/.test(session) &&
  typeof term === "string" &&
  VALID_TERMS.includes(term) &&
  typeof date === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(date) &&
  !Number.isNaN(Date.parse(`${date}T00:00:00Z`));

const ensureClass = async (classId: string, organization: ObjectId) =>
  ClassModel.findOne({
    _id: new ObjectId(classId),
    organization,
    is_active: true,
  }).select("name level section other_section");

const getRosterQuery = (
  organization: ObjectId,
  classId: ObjectId,
  session: string,
  term: string
) => ({
  organization,
  is_deleted: false,
  $or: [
    {
      "academic_details.progression_history": {
        $elemMatch: {
          from_session: session,
          from_term: term,
          from_class: classId,
        },
      },
    },
    {
      "academic_details.class": classId,
      "academic_details.current_session": session,
      "academic_details.current_term": term,
      is_active: true,
    },
    {
      "academic_details.class": classId,
      "academic_details.current_session": { $exists: false },
      is_active: true,
    },
  ],
});

export const getAttendanceRegister = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { class_id, session, term, date } = req.query;

    if (
      !isValidRegisterKey({
        classId: class_id,
        session,
        term,
        date,
      })
    ) {
      return errorResponse(
        res,
        400,
        "Class, session, term, and date are required",
      );
    }

    const organization = new ObjectId(account.organization_id);
    const classRecord = await ensureClass(class_id as string, organization);
    if (!classRecord) return errorResponse(res, 404, "Class not found");

    const classObjectId = new ObjectId(class_id as string);
    const students = await StudentModel.find(
      getRosterQuery(
        organization,
        classObjectId,
        session as string,
        term as string
      )
    )
      .select("registration_number personal_information")
      .sort({
        "personal_information.last_name": 1,
        "personal_information.first_name": 1,
      });

    const attendance = await AttendanceModel.findOne({
      organization,
      class: classObjectId,
      session,
      term,
      date,
    }).select("records recorded_by createdAt updatedAt");
    const recordByStudent = new Map(
      (attendance?.records ?? []).map((record) => [
        String(record.student),
        record,
      ]),
    );

    return successResponse(res, 200, {
      class: classRecord,
      date,
      session,
      term,
      is_recorded: Boolean(attendance),
      students: students.map((student) => {
        const record = recordByStudent.get(String(student._id));
        return {
          _id: student._id,
          registration_number: student.registration_number,
          personal_information: student.personal_information,
          status: record?.status,
          remark: record?.remark ?? "",
        };
      }),
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const saveAttendanceRegister = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { class_id, session, term, date, records } = req.body;

    if (
      !isValidRegisterKey({ classId: class_id, session, term, date }) ||
      !Array.isArray(records)
    ) {
      return errorResponse(
        res,
        400,
        "A complete attendance register is required",
      );
    }

    const organization = new ObjectId(account.organization_id);
    const classRecord = await ensureClass(class_id, organization);
    if (!classRecord) return errorResponse(res, 404, "Class not found");

    const classObjectId = new ObjectId(class_id);
    const students = await StudentModel.find(
      getRosterQuery(organization, classObjectId, session, term)
    ).select("_id");
    const rosterIds = new Set(students.map((student) => String(student._id)));
    const submittedIds = records.map((record) => String(record.student));

    const invalidRecord = records.some((record) => {
      const remark = record.remark ?? "";
      return (
        !ObjectId.isValid(record.student) ||
        !rosterIds.has(String(record.student)) ||
        !VALID_STATUSES.includes(record.status) ||
        typeof remark !== "string" ||
        remark.length > 250
      );
    });
    if (
      records.length !== rosterIds.size ||
      new Set(submittedIds).size !== submittedIds.length ||
      invalidRecord
    ) {
      return errorResponse(
        res,
        400,
        "Attendance must include each active student exactly once",
      );
    }

    const normalizedRecords = records.map((record) => ({
      student: new ObjectId(record.student),
      status: record.status,
      remark: String(record.remark ?? "").trim(),
    }));
    const attendance = await AttendanceModel.findOneAndUpdate(
      {
        organization,
        class: classObjectId,
        session,
        term,
        date,
      },
      {
        $set: {
          records: normalizedRecords,
          recorded_by: new ObjectId(account.account_id),
        },
        $setOnInsert: {
          organization,
          class: classObjectId,
          session,
          term,
          date,
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    return successResponse(res, 200, attendance);
  } catch (error: any) {
    if (error?.code === 11000) {
      return errorResponse(res, 409, "Attendance already exists for this date");
    }
    return errorResponse(res, 500, error.message);
  }
};

export const getStudentAttendanceSummary = async (
  req: Request,
  res: Response,
) => {
  try {
    const { account } = req;
    const { student_id } = req.params;
    const { session, term } = req.query;

    if (!ObjectId.isValid(student_id)) {
      return errorResponse(res, 400, "Invalid student");
    }

    const organization = new ObjectId(account.organization_id);
    const student = await StudentModel.exists({
      _id: new ObjectId(student_id),
      organization,
      is_deleted: false,
    });
    if (!student) return errorResponse(res, 404, "Student not found");

    const query: Record<string, unknown> = {
      organization,
      "records.student": new ObjectId(student_id),
    };
    if (session) query.session = session;
    if (term) query.term = term;

    const attendanceDocuments = await AttendanceModel.find(query)
      .populate({ path: "class", select: "name" })
      .sort({ date: -1 });
    const history = attendanceDocuments.flatMap((document) => {
      const record = document.records.find(
        (item) => String(item.student) === student_id,
      );
      if (!record) return [];
      return [
        {
          attendance_id: document._id,
          date: document.date,
          session: document.session,
          term: document.term,
          class: document.class,
          status: record.status,
          remark: record.remark ?? "",
        },
      ];
    });

    const counts = {
      present: history.filter(
        (item) => item.status === EAttendanceStatus.PRESENT,
      ).length,
      absent: history.filter((item) => item.status === EAttendanceStatus.ABSENT)
        .length,
      late: history.filter((item) => item.status === EAttendanceStatus.LATE)
        .length,
      excused: history.filter(
        (item) => item.status === EAttendanceStatus.EXCUSED,
      ).length,
    };
    const countableDays = history.length - counts.excused;
    const attendedDays = counts.present + counts.late;
    const attendancePercentage =
      countableDays === 0
        ? 0
        : Math.round((attendedDays / countableDays) * 10000) / 100;

    return successResponse(res, 200, {
      total_days: history.length,
      attendance_percentage: attendancePercentage,
      counts,
      history,
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
