import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import { EAccountType } from "../interface";
import AccountModel from "../models/account";
import AttendanceModel from "../models/attendance";
import ClassModel from "../models/class";
import InvoiceModel from "../models/invoice";
import OrganizationModel from "../models/organization";
import ParentProfileModel from "../models/parent_profile";
import StaffModel from "../models/staff";
import StudentProfileModel from "../models/student_profile";
import StudentModel from "../models/student";
import SubjectModel from "../models/subject";
import TeacherProfileModel from "../models/teacher_profile";
import TeacherResultSubmissionModel from "../models/teacher_result_submission";
import TimetableModel from "../models/timetable";
import { errorResponse, successResponse } from "../utils/responseHandler";

type CountRow = { _id: ObjectId; count: number };
type ActivityRow = { _id: ObjectId; last_active: Date };
type InvoiceRow = {
  _id: ObjectId;
  invoices: number;
  billed: number;
  collected: number;
  overdue: number;
};

const groupCounts = (model: any, schoolIds: ObjectId[], match = {}) =>
  model.aggregate([
    { $match: { organization: { $in: schoolIds }, ...match } },
    { $group: { _id: "$organization", count: { $sum: 1 } } },
  ]) as Promise<CountRow[]>;

const countMap = (rows: CountRow[]) =>
  new Map(rows.map(row => [String(row._id), row.count]));

const sumMap = (values: Map<string, number>) =>
  [...values.values()].reduce((total, value) => total + value, 0);

const hasProfile = (school: any) =>
  Boolean(
    school.name?.trim() &&
      school.description?.trim() &&
      school.address?.street?.trim() &&
      school.address?.country?.trim(),
  );

const hasAcademicPeriod = (school: any) =>
  Boolean(
    school.academic_settings?.current_session &&
      school.academic_settings?.current_term,
  );

const getSetupProgress = (checks: boolean[]) =>
  Math.round((checks.filter(Boolean).length / checks.length) * 100);

const getAttentionReasons = ({
  setupProgress,
  lastActive,
  students,
  teacherPortals,
  overdueInvoices,
}: {
  setupProgress: number;
  lastActive?: Date;
  students: number;
  teacherPortals: number;
  overdueInvoices: number;
}) => {
  const reasons: string[] = [];
  const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
  if (setupProgress < 100) reasons.push("Setup incomplete");
  if (!lastActive || lastActive.getTime() < fourteenDaysAgo) {
    reasons.push("No login in 14 days");
  }
  if (students > 0 && teacherPortals === 0) {
    reasons.push("No teacher portals");
  }
  if (overdueInvoices > 0) reasons.push("Overdue invoices");
  return reasons;
};

export const getPlatformMetrics = async (req: Request, res: Response) => {
  try {
    const ascendOrganization = new ObjectId(req.account.organization_id);
    const schools = await OrganizationModel.find({
      _id: { $ne: ascendOrganization },
    })
      .select("name description address academic_settings createdAt")
      .sort({ createdAt: -1 })
      .lean();
    const schoolIds = schools.map(school => new ObjectId(school._id));
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const [
      classRows,
      subjectRows,
      studentRows,
      activeStudentRows,
      staffRows,
      teacherPortalRows,
      parentPortalRows,
      studentPortalRows,
      timetableRows,
      attendanceRows,
      resultRows,
      accountActivityRows,
      invoiceRows,
      primaryAdmins,
    ] = await Promise.all([
      groupCounts(ClassModel, schoolIds, { is_active: true }),
      groupCounts(SubjectModel, schoolIds),
      groupCounts(StudentModel, schoolIds, { is_deleted: false }),
      groupCounts(StudentModel, schoolIds, {
        is_deleted: false,
        is_active: true,
      }),
      groupCounts(StaffModel, schoolIds, {
        date_deleted: { $exists: false },
      }),
      groupCounts(TeacherProfileModel, schoolIds),
      groupCounts(ParentProfileModel, schoolIds),
      groupCounts(StudentProfileModel, schoolIds),
      groupCounts(TimetableModel, schoolIds),
      groupCounts(AttendanceModel, schoolIds, {
        createdAt: { $gte: thirtyDaysAgo },
      }),
      TeacherResultSubmissionModel.aggregate<CountRow>([
        {
          $match: {
            organization: { $in: schoolIds },
            updatedAt: { $gte: thirtyDaysAgo },
            status: { $in: ["pending", "approved"] },
          },
        },
        { $group: { _id: "$organization", count: { $sum: 1 } } },
      ]),
      AccountModel.aggregate<ActivityRow>([
        {
          $match: {
            organization: { $in: schoolIds },
            last_login: { $exists: true },
          },
        },
        { $group: { _id: "$organization", last_active: { $max: "$last_login" } } },
      ]),
      InvoiceModel.aggregate<InvoiceRow>([
        { $match: { organization: { $in: schoolIds } } },
        {
          $group: {
            _id: "$organization",
            invoices: { $sum: 1 },
            billed: { $sum: "$total_amount" },
            collected: { $sum: "$amount_paid" },
            overdue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $lt: ["$due_date", now] },
                      { $ne: ["$status", "paid"] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      AccountModel.find({
        organization: { $in: schoolIds },
        account_type: EAccountType.ADMIN,
      })
        .select("organization first_name last_name email createdAt")
        .sort({ createdAt: 1 })
        .lean(),
    ]);

    const classes = countMap(classRows);
    const subjects = countMap(subjectRows);
    const students = countMap(studentRows);
    const activeStudents = countMap(activeStudentRows);
    const staff = countMap(staffRows);
    const teacherPortals = countMap(teacherPortalRows);
    const parentPortals = countMap(parentPortalRows);
    const studentPortals = countMap(studentPortalRows);
    const timetables = countMap(timetableRows);
    const attendance = countMap(attendanceRows);
    const results = countMap(resultRows);
    const activity = new Map(
      accountActivityRows.map(row => [String(row._id), row.last_active]),
    );
    const invoices = new Map(
      invoiceRows.map(row => [String(row._id), row]),
    );
    const admins = new Map<string, (typeof primaryAdmins)[number]>();
    primaryAdmins.forEach(admin => {
      const id = String(admin.organization);
      if (!admins.has(id)) admins.set(id, admin);
    });

    const schoolSummaries = schools.map(school => {
      const id = String(school._id);
      const schoolStudents = students.get(id) ?? 0;
      const schoolTeacherPortals = teacherPortals.get(id) ?? 0;
      const schoolInvoice = invoices.get(id);
      const lastActive = activity.get(id);
      const setupProgress = getSetupProgress([
        hasProfile(school),
        hasAcademicPeriod(school),
        (classes.get(id) ?? 0) > 0,
        (subjects.get(id) ?? 0) > 0,
        schoolStudents > 0,
        (staff.get(id) ?? 0) > 0,
        schoolTeacherPortals > 0,
        (timetables.get(id) ?? 0) > 0,
      ]);
      const admin = admins.get(id);
      const attentionReasons = getAttentionReasons({
        setupProgress,
        lastActive,
        students: schoolStudents,
        teacherPortals: schoolTeacherPortals,
        overdueInvoices: schoolInvoice?.overdue ?? 0,
      });

      return {
        id,
        name: school.name,
        created_at: (school as any).createdAt,
        current_session: school.academic_settings?.current_session,
        current_term: school.academic_settings?.current_term,
        admin: admin
          ? {
              name: `${admin.first_name ?? ""} ${admin.last_name ?? ""}`.trim(),
              email: admin.email,
            }
          : null,
        setup_progress: setupProgress,
        last_active: lastActive,
        students: schoolStudents,
        active_students: activeStudents.get(id) ?? 0,
        staff: staff.get(id) ?? 0,
        teacher_portals: schoolTeacherPortals,
        parent_portals: parentPortals.get(id) ?? 0,
        student_portals: studentPortals.get(id) ?? 0,
        attendance_registers_30_days: attendance.get(id) ?? 0,
        result_submissions_30_days: results.get(id) ?? 0,
        invoices: schoolInvoice?.invoices ?? 0,
        billed: schoolInvoice?.billed ?? 0,
        collected: schoolInvoice?.collected ?? 0,
        overdue_invoices: schoolInvoice?.overdue ?? 0,
        attention_reasons: attentionReasons,
      };
    });

    const totalBilled = invoiceRows.reduce((sum, row) => sum + row.billed, 0);
    const totalCollected = invoiceRows.reduce(
      (sum, row) => sum + row.collected,
      0,
    );
    const onboardingComplete = schoolSummaries.filter(
      school => school.setup_progress === 100,
    ).length;
    const newSchools = schools.filter(
      school => new Date((school as any).createdAt) >= thirtyDaysAgo,
    ).length;
    const activeInLast7Days = schoolSummaries.filter(
      school => school.last_active && new Date(school.last_active) >= sevenDaysAgo,
    ).length;
    const activeInLast30Days = schoolSummaries.filter(
      school => school.last_active && new Date(school.last_active) >= thirtyDaysAgo,
    ).length;

    return successResponse(res, 200, {
      totals: {
        schools: schools.length,
        new_schools_30_days: newSchools,
        active_schools_7_days: activeInLast7Days,
        active_schools_30_days: activeInLast30Days,
        onboarding_complete: onboardingComplete,
        average_setup_progress: schools.length
          ? Math.round(
              schoolSummaries.reduce(
                (sum, school) => sum + school.setup_progress,
                0,
              ) / schools.length,
            )
          : 0,
        students: sumMap(students),
        active_students: sumMap(activeStudents),
        staff: sumMap(staff),
        teacher_portals: sumMap(teacherPortals),
        parent_portals: sumMap(parentPortals),
        student_portals: sumMap(studentPortals),
        attendance_registers_30_days: sumMap(attendance),
        result_submissions_30_days: sumMap(results),
        invoices: invoiceRows.reduce((sum, row) => sum + row.invoices, 0),
        billed: totalBilled,
        collected: totalCollected,
        overdue_invoices: invoiceRows.reduce(
          (sum, row) => sum + row.overdue,
          0,
        ),
        collection_rate: totalBilled
          ? Math.round((totalCollected / totalBilled) * 100)
          : 0,
      },
      recent_schools: schoolSummaries.slice(0, 6),
      schools_needing_attention: schoolSummaries
        .filter(school => school.attention_reasons.length > 0)
        .sort(
          (left, right) =>
            right.attention_reasons.length - left.attention_reasons.length,
        )
        .slice(0, 10),
      schools: schoolSummaries,
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
