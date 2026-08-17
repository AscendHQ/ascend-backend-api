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

type TeacherAssignment = { class: ObjectId; subjects: ObjectId[] };

const parseAssignments = (value: unknown): TeacherAssignment[] | null => {
  if (!Array.isArray(value) || value.length === 0) return null;
  const classIds = new Set<string>();
  const assignments: TeacherAssignment[] = [];
  for (const item of value) {
    const input = item as { class_id?: unknown; subject_ids?: unknown };
    const classId = String(input?.class_id ?? "");
    if (!ObjectId.isValid(classId) || classIds.has(classId)) return null;
    if (!Array.isArray(input.subject_ids) || input.subject_ids.length === 0) return null;
    const subjectIds = [...new Set(input.subject_ids.map(String))];
    if (subjectIds.some((id) => !ObjectId.isValid(id))) return null;
    classIds.add(classId);
    assignments.push({
      class: new ObjectId(classId),
      subjects: subjectIds.map((id) => new ObjectId(id)),
    });
  }
  return assignments;
};

const validateAssignments = async (
  organization: ObjectId,
  assignments: TeacherAssignment[],
) => {
  const classIds = assignments.map((assignment) => assignment.class);
  const subjectIds = assignments.flatMap((assignment) => assignment.subjects);
  const [classCount, subjects] = await Promise.all([
    ClassModel.countDocuments({
      _id: { $in: classIds },
      organization,
      is_active: true,
    }),
    SubjectModel.find({
      _id: { $in: subjectIds },
      organization,
    }).select("_id classes"),
  ]);
  if (classCount !== classIds.length) return false;
  const subjectsById = new Map(subjects.map((subject) => [String(subject._id), subject]));
  return assignments.every((assignment) =>
    assignment.subjects.every((subjectId) => {
      const subject = subjectsById.get(String(subjectId));
      return subject?.classes.some(
        (classId) => String(classId) === String(assignment.class),
      );
    }),
  );
};

const assignmentPopulates = [
  { path: "assignments.class", select: "name level section other_section" },
  { path: "assignments.subjects", select: "name code type classes" },
];

const referenceId = (value: any) => String(value?._id ?? value);
const legacySubjectsForClass = (subjects: any[], classInfo: any) =>
  subjects.filter(
    (subject) =>
      !subject.classes?.length ||
      subject.classes.some(
        (subjectClass: any) =>
          referenceId(subjectClass) === referenceId(classInfo),
      ),
  );

const withLegacyAssignments = (profile: any) => {
  if (profile.assignments?.length) return profile;
  return {
    ...profile,
    assignments: (profile.classes ?? []).map((classInfo: any) => ({
      class: classInfo,
      subjects: legacySubjectsForClass(profile.subjects ?? [], classInfo),
    })),
  };
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
    const assignments = parseAssignments(req.body.assignments);
    if (
      !ObjectId.isValid(staff_id) ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== "string" ||
      !PASSWORD_PATTERN.test(password) ||
      !assignments
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
    if (!(await validateAssignments(organization, assignments))) {
      return errorResponse(
        res,
        400,
        "Each subject must belong to its assigned class",
      );
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
      assignments,
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
      .populate({ path: "subjects", select: "name code type classes" })
      .populate(assignmentPopulates)
      .sort({ createdAt: -1 })
      .lean();
    return successResponse(res, 200, profiles.map(withLegacyAssignments));
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateTeacherPortalAssignments = async (
  req: Request,
  res: Response,
) => {
  try {
    const { profile_id } = req.params;
    const assignments = parseAssignments(req.body.assignments);
    if (!ObjectId.isValid(profile_id) || !assignments) {
      return errorResponse(res, 400, "Valid teacher assignments are required");
    }
    const organization = new ObjectId(req.account.organization_id);
    if (!(await validateAssignments(organization, assignments))) {
      return errorResponse(
        res,
        400,
        "Each subject must belong to its assigned class",
      );
    }
    const profile = await TeacherProfileModel.findOneAndUpdate(
      { _id: new ObjectId(profile_id), organization },
      { $set: { assignments }, $unset: { classes: 1, subjects: 1 } },
      { new: true, runValidators: true },
    ).populate(assignmentPopulates);
    if (!profile) return errorResponse(res, 404, "Teacher profile not found");
    return successResponse(res, 200, profile);
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
        .populate({ path: "subjects", select: "name code type classes" })
        .populate(assignmentPopulates)
        .lean(),
      OrganizationModel.findById(organization).select("academic_settings"),
    ]);
    const session = school?.academic_settings?.current_session;
    const term = school?.academic_settings?.current_term;
    const rawAssignments = (profile.assignments ?? []) as unknown as TeacherAssignment[];
    const classIds = rawAssignments.length
      ? rawAssignments.map((assignment) => assignment.class)
      : (profile.classes as ObjectId[]);
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
      profile: withLegacyAssignments(populatedProfile),
      academic_period: { session, term },
      summary: { student_count: studentCount, attendance_count: attendanceCount, approved_result_count: approvedResultCount },
      students,
      timetables,
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
