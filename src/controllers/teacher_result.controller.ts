import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import { EGrade, EStatus } from "../interface";
import ClassModel from "../models/class";
import ResultModel from "../models/result";
import StudentModel from "../models/student";
import SubjectModel from "../models/subject";
import SubjectRegistrationModel from "../models/subject_registration";
import TeacherProfileModel from "../models/teacher_profile";
import TeacherResultSubmissionModel from "../models/teacher_result_submission";
import { errorResponse, successResponse } from "../utils/responseHandler";

const VALID_TERMS = ["1st Term", "2nd Term", "3rd Term"];

const getGrade = (total: number): EGrade => {
  if (total >= 70) return EGrade.A;
  if (total >= 60) return EGrade.B;
  if (total >= 50) return EGrade.C;
  if (total >= 40) return EGrade.D;
  return EGrade.F;
};

const hasValidKey = (body: Record<string, unknown>) =>
  typeof body.class_id === "string" &&
  ObjectId.isValid(body.class_id) &&
  typeof body.subject_id === "string" &&
  ObjectId.isValid(body.subject_id) &&
  typeof body.session === "string" &&
  /^\d{4}\/\d{4}$/.test(body.session) &&
  typeof body.term === "string" &&
  VALID_TERMS.includes(body.term);

const getAssignment = async (
  accountId: string,
  organization: ObjectId,
  classId: ObjectId,
  subjectId: ObjectId,
) =>
  TeacherProfileModel.findOne({
    account: new ObjectId(accountId),
    organization,
    $or: [
      { assignments: { $elemMatch: { class: classId, subjects: subjectId } } },
      { classes: classId, subjects: subjectId },
    ],
  });

export const getRegisteredStudents = async ({
  organization,
  classId,
  subjectId,
  session,
  term,
}: {
  organization: ObjectId;
  classId: ObjectId;
  subjectId: ObjectId;
  session: string;
  term: string;
}) => {
  const [students, subject] = await Promise.all([
    StudentModel.find({
      organization,
      is_active: true,
      is_deleted: false,
      "academic_details.class": classId,
    })
      .select("registration_number personal_information")
      .sort({
        "personal_information.last_name": 1,
        "personal_information.first_name": 1,
      }),
    SubjectModel.findOne({ _id: subjectId, organization, classes: classId }),
  ]);
  if (!subject) return null;
  const registrations = await SubjectRegistrationModel.find({
    organization,
    class: classId,
    session,
    term,
    student: { $in: students.map((student) => student._id) },
  }).select("student selected_subjects additional_subjects");
  const registrationByStudent = new Map(
    registrations.map((registration) => [String(registration.student), registration]),
  );
  return students.filter((student) => {
    // Core subjects apply to every active student in the class. Subject
    // registration is only needed to decide who takes an elective.
    if (subject.type === "core") return true;
    const registration = registrationByStudent.get(String(student._id));
    if (!registration) return false;
    if (registration.selected_subjects) {
      return registration.selected_subjects.some(
        (item) => String(item) === String(subjectId),
      );
    }
    return (registration.additional_subjects ?? []).some(
      (item) => String(item) === String(subjectId),
    );
  });
};

const parseRecords = (value: unknown) => {
  if (!Array.isArray(value)) return null;
  const records = value.map((item) => {
    const input = item as Record<string, unknown>;
    const mid_term_test = Number(input.mid_term_test);
    const ca_score = Number(input.ca_score);
    const exam_score = Number(input.exam_score);
    const total = mid_term_test + ca_score + exam_score;
    return {
      student: String(input.student ?? ""),
      mid_term_test,
      ca_score,
      exam_score,
      total,
      grade: getGrade(total),
    };
  });
  const invalid = records.some(
    (record) =>
      !ObjectId.isValid(record.student) ||
      [record.mid_term_test, record.ca_score, record.exam_score].some(
        (score) => !Number.isFinite(score) || score < 0,
      ) ||
      record.total > 100,
  );
  return invalid ? null : records;
};

const getRequestKey = (source: Record<string, unknown>) => ({
  class_id: source.class_id,
  subject_id: source.subject_id,
  session: source.session,
  term: source.term,
});

export const getTeacherResultRegister = async (req: Request, res: Response) => {
  try {
    const key = getRequestKey(req.query as Record<string, unknown>);
    if (!hasValidKey(key)) {
      return errorResponse(res, 400, "Class, subject, session, and term are required");
    }
    const organization = new ObjectId(req.account.organization_id);
    const classId = new ObjectId(key.class_id as string);
    const subjectId = new ObjectId(key.subject_id as string);
    const profile = await getAssignment(
      req.account.account_id,
      organization,
      classId,
      subjectId,
    );
    if (!profile) return errorResponse(res, 403, "This subject is not assigned to you");
    const [students, classRecord, subject, submission] = await Promise.all([
      getRegisteredStudents({
        organization,
        classId,
        subjectId,
        session: key.session as string,
        term: key.term as string,
      }),
      ClassModel.findById(classId).select("name level section other_section"),
      SubjectModel.findById(subjectId).select("name code type"),
      TeacherResultSubmissionModel.findOne({
        organization,
        teacher_profile: profile._id,
        class: classId,
        subject: subjectId,
        session: key.session,
        term: key.term,
      }).lean(),
    ]);
    if (!students || !classRecord || !subject) {
      return errorResponse(res, 404, "Assigned class or subject not found");
    }
    const scoresByStudent = new Map(
      (submission?.records ?? []).map((record: any) => [String(record.student), record]),
    );
    return successResponse(res, 200, {
      class: classRecord,
      subject,
      session: key.session,
      term: key.term,
      submission: submission
        ? {
            _id: submission._id,
            status: submission.status,
            review_note: submission.review_note,
            updatedAt: submission.updatedAt,
          }
        : null,
      students: students.map((student) => ({
        _id: student._id,
        registration_number: student.registration_number,
        personal_information: student.personal_information,
        scores: scoresByStudent.get(String(student._id)) ?? null,
      })),
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const saveTeacherResultRegister = async (req: Request, res: Response) => {
  try {
    const key = getRequestKey(req.body);
    const records = parseRecords(req.body.records);
    const action = req.body.action;
    if (!hasValidKey(key) || !records || !["draft", "submit"].includes(action)) {
      return errorResponse(res, 400, "Valid result records are required");
    }
    const organization = new ObjectId(req.account.organization_id);
    const classId = new ObjectId(key.class_id as string);
    const subjectId = new ObjectId(key.subject_id as string);
    const profile = await getAssignment(
      req.account.account_id,
      organization,
      classId,
      subjectId,
    );
    if (!profile) return errorResponse(res, 403, "This subject is not assigned to you");
    const students = await getRegisteredStudents({
      organization,
      classId,
      subjectId,
      session: key.session as string,
      term: key.term as string,
    });
    if (!students) return errorResponse(res, 404, "Assigned subject not found");
    const rosterIds = new Set(students.map((student) => String(student._id)));
    const submittedIds = records.map((record) => record.student);
    const hasInvalidStudents =
      new Set(submittedIds).size !== submittedIds.length ||
      submittedIds.some((studentId) => !rosterIds.has(studentId));
    const incompleteSubmission =
      action === "submit" && submittedIds.length !== rosterIds.size;
    if (hasInvalidStudents || incompleteSubmission) {
      return errorResponse(
        res,
        400,
        "Submitted results must match the registered students",
      );
    }
    const existing = await TeacherResultSubmissionModel.findOne({
      organization,
      teacher_profile: profile._id,
      class: classId,
      subject: subjectId,
      session: key.session,
      term: key.term,
    }).select("status");
    if (existing?.status === "approved") {
      return errorResponse(res, 409, "Approved results can no longer be edited");
    }
    const status = action === "submit" ? "pending" : "draft";
    const submission = await TeacherResultSubmissionModel.findOneAndUpdate(
      {
        organization,
        teacher_profile: profile._id,
        class: classId,
        subject: subjectId,
        session: key.session,
        term: key.term,
      },
      {
        $set: {
          records: records.map((record) => ({
            ...record,
            student: new ObjectId(record.student),
          })),
          status,
          submitted_at: action === "submit" ? new Date() : undefined,
          review_note: "",
        },
        $setOnInsert: {
          organization,
          teacher_profile: profile._id,
          class: classId,
          subject: subjectId,
          session: key.session,
          term: key.term,
        },
        $unset: { reviewed_by: 1, reviewed_at: 1 },
      },
      { new: true, upsert: true, runValidators: true },
    );
    return successResponse(res, 200, submission);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getTeacherResultSubmissions = async (req: Request, res: Response) => {
  try {
    const organization = new ObjectId(req.account.organization_id);
    const status = typeof req.query.status === "string" ? req.query.status : "pending";
    const submissions = await TeacherResultSubmissionModel.find({
      organization,
      ...(status === "all" ? {} : { status }),
    })
      .populate({
        path: "teacher_profile",
        populate: { path: "staff", select: "surname other_names staff_no" },
      })
      .populate({ path: "class", select: "name level section other_section" })
      .populate({ path: "subject", select: "name code" })
      .populate({
        path: "records.student",
        select: "registration_number personal_information",
      })
      .sort({ submitted_at: -1, updatedAt: -1 });
    return successResponse(res, 200, submissions);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

const mergeApprovedSubmission = async (submission: any) => {
  await Promise.all(
    submission.records.map(async (record: any) => {
      let result = await ResultModel.findOne({
        organization: submission.organization,
        student: record.student,
        session: submission.session,
        term: submission.term,
      });
      if (!result) {
        result = new ResultModel({
          organization: submission.organization,
          student: record.student,
          session: submission.session,
          term: submission.term,
          blocks: [],
          status: EStatus.APPROVED,
        });
      }
      const block = result.blocks.find(
        (item) => String(item.subject) === String(submission.subject),
      );
      const values = {
        subject: submission.subject,
        mid_term_test: record.mid_term_test,
        ca_score: record.ca_score,
        exam_score: record.exam_score,
        total: record.total,
        grade: record.grade,
      };
      if (block) Object.assign(block, values);
      else result.blocks.push(values as any);
      result.status = EStatus.APPROVED;
      await result.save();
    }),
  );
};

export const reviewTeacherResultSubmission = async (
  req: Request,
  res: Response,
) => {
  try {
    const { submission_id } = req.params;
    const { decision, note = "" } = req.body;
    if (
      !ObjectId.isValid(submission_id) ||
      !["approved", "rejected"].includes(decision) ||
      typeof note !== "string" ||
      note.length > 500
    ) {
      return errorResponse(res, 400, "A valid review decision is required");
    }
    const organization = new ObjectId(req.account.organization_id);
    const submission = await TeacherResultSubmissionModel.findOne({
      _id: new ObjectId(submission_id),
      organization,
      status: "pending",
    });
    if (!submission) return errorResponse(res, 404, "Pending submission not found");
    if (decision === "approved") await mergeApprovedSubmission(submission);
    submission.status = decision;
    submission.review_note = note.trim();
    submission.set("reviewed_by", new ObjectId(req.account.account_id));
    submission.reviewed_at = new Date();
    await submission.save();
    return successResponse(res, 200, submission);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
