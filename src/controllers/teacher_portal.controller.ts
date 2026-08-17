import { hash } from "bcryptjs";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import { EAccountType, ESystemAccessLevel } from "../interface";
import AccountModel from "../models/account";
import AttendanceModel from "../models/attendance";
import ClassModel from "../models/class";
import OrganizationModel from "../models/organization";
import PermissionModel from "../models/permission";
import ResultModel from "../models/result";
import StaffModel from "../models/staff";
import StudentModel from "../models/student";
import SubjectModel from "../models/subject";
import TeacherProfileModel from "../models/teacher_profile";
import TimetableModel from "../models/timetable";
import { errorResponse, successResponse } from "../utils/responseHandler";

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/;

const uniqueObjectIds = (values: unknown) => {
  if (!Array.isArray(values)) return null;
  const ids = [...new Set<string>(values.map(String))];
  return ids.some((id) => !ObjectId.isValid(id))
    ? null
    : ids.map((id) => new ObjectId(id));
};

const getTeacherPermission = async (organization: ObjectId) =>
  (await PermissionModel.findOne({ organization, name: "Teacher Portal" })) ??
  PermissionModel.create({
    organization,
    name: "Teacher Portal",
    description: "Restricted access to assigned classes and subjects.",
  });

const getTeacherProfile = (accountId: string, organization: ObjectId) =>
  TeacherProfileModel.findOne({
    account: new ObjectId(accountId),
    organization,
  });

export const createTeacherPortalAccount = async (
  req: Request,
  res: Response,
) => {
  let createdAccountId: ObjectId | undefined;
  try {
    const { staff_id, email, password } = req.body;
    const classes = uniqueObjectIds(req.body.class_ids);
    const subjects = uniqueObjectIds(req.body.subject_ids);
    if (
      !ObjectId.isValid(staff_id) ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== "string" ||
      !PASSWORD_PATTERN.test(password) ||
      !classes ||
      !subjects ||
      classes.length === 0
    ) {
      return errorResponse(res, 400, "Valid teacher portal details are required");
    }
    const organization = new ObjectId(req.account.organization_id);
    const normalizedEmail = email.trim().toLowerCase();
    if (await AccountModel.exists({ email: normalizedEmail })) {
      return errorResponse(res, 409, "An account with this email already exists");
    }
    const staff = await StaffModel.findOne({
      _id: new ObjectId(staff_id),
      organization,
      status: "teaching",
      date_deleted: { $exists: false },
    });
    if (!staff) return errorResponse(res, 404, "Teaching staff record not found");
    if (await TeacherProfileModel.exists({ organization, staff: staff._id })) {
      return errorResponse(res, 409, "This teacher already has a portal account");
    }
    const [classCount, subjectCount] = await Promise.all([
      ClassModel.countDocuments({ _id: { $in: classes }, organization, is_active: true }),
      SubjectModel.countDocuments({ _id: { $in: subjects }, organization }),
    ]);
    if (classCount !== classes.length || subjectCount !== subjects.length) {
      return errorResponse(res, 400, "One or more assignments are invalid");
    }
    const permission = await getTeacherPermission(organization);
    const account = await AccountModel.create({
      first_name: staff.other_names,
      last_name: staff.surname,
      email: normalizedEmail,
      password: await hash(password, 10),
      organization,
      permission: permission._id,
      access_level: ESystemAccessLevel.NORMAL_USER,
      account_type: EAccountType.TEACHER,
      is_email_verified: true,
      is_verified: true,
    });
    createdAccountId = account._id;
    const profile = await TeacherProfileModel.create({
      organization,
      account: account._id,
      staff: staff._id,
      classes,
      subjects,
      created_by: new ObjectId(req.account.account_id),
    });
    return successResponse(res, 201, { profile, email: account.email });
  } catch (error: any) {
    if (createdAccountId) await AccountModel.deleteOne({ _id: createdAccountId });
    return errorResponse(res, 500, error.message);
  }
};

export const getTeacherPortalAccounts = async (req: Request, res: Response) => {
  try {
    const profiles = await TeacherProfileModel.find({
      organization: new ObjectId(req.account.organization_id),
    })
      .populate({ path: "account", select: "first_name last_name email account_type" })
      .populate({ path: "staff", select: "staff_no surname other_names department post" })
      .populate({ path: "classes", select: "name level section other_section" })
      .populate({ path: "subjects", select: "name code type" })
      .sort({ createdAt: -1 });
    return successResponse(res, 200, profiles);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getTeacherPortalDashboard = async (
  req: Request,
  res: Response,
) => {
  try {
    const organization = new ObjectId(req.account.organization_id);
    const profile = await getTeacherProfile(req.account.account_id, organization);
    if (!profile) return errorResponse(res, 404, "Teacher profile not found");
    const [populatedProfile, school] = await Promise.all([
      TeacherProfileModel.findById(profile._id)
        .populate({ path: "staff", select: "staff_no surname other_names department post" })
        .populate({ path: "classes", select: "name level section other_section" })
        .populate({ path: "subjects", select: "name code type" }),
      OrganizationModel.findById(organization).select("academic_settings"),
    ]);
    const session = school?.academic_settings?.current_session;
    const term = school?.academic_settings?.current_term;
    const classIds = profile.classes as ObjectId[];
    const studentQuery = {
      organization,
      is_active: true,
      is_deleted: false,
      "academic_details.class": { $in: classIds },
    };
    const [studentCount, students, timetables, attendanceCount] =
      await Promise.all([
        StudentModel.countDocuments(studentQuery),
        StudentModel.find(studentQuery)
          .select("registration_number personal_information academic_details.class")
          .populate({ path: "academic_details.class", select: "name section other_section" })
          .sort({ "personal_information.last_name": 1 }),
        session && term
          ? TimetableModel.find({
              organization,
              class: { $in: classIds },
              session,
              term,
            }).populate({ path: "class", select: "name section other_section" })
          : [],
        session && term
          ? AttendanceModel.countDocuments({
              organization,
              class: { $in: classIds },
              session,
              term,
            })
          : 0,
      ]);
    const studentIds = students.map((student) => student._id);
    const approvedResultCount = await ResultModel.countDocuments({
      organization,
      student: { $in: studentIds },
      ...(session ? { session } : {}),
      ...(term ? { term } : {}),
      $or: [{ status: "approved" }, { status: { $exists: false } }],
    });
    return successResponse(res, 200, {
      profile: populatedProfile,
      academic_period: { session, term },
      summary: { student_count: studentCount, attendance_count: attendanceCount, approved_result_count: approvedResultCount },
      students,
      timetables,
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
