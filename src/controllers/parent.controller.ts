import { hash } from "bcryptjs";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import { EAccountType, EAttendanceStatus, ESystemAccessLevel } from "../interface";
import AccountModel from "../models/account";
import AttendanceModel from "../models/attendance";
import InvoiceModel from "../models/invoice";
import ParentProfileModel from "../models/parent_profile";
import PaymentModel from "../models/payment";
import PermissionModel from "../models/permission";
import ResultModel from "../models/result";
import StudentModel from "../models/student";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { createInvoicePaymentUrl } from "./paystack.controller";

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/;

const validateStudentIds = async (
  studentIds: unknown,
  organization: ObjectId,
) => {
  if (!Array.isArray(studentIds) || studentIds.length === 0) return null;
  const uniqueIds = [...new Set(studentIds.map(String))];
  if (uniqueIds.some((studentId) => !ObjectId.isValid(studentId))) return null;
  const students = await StudentModel.find({
    _id: { $in: uniqueIds.map((studentId) => new ObjectId(studentId)) },
    organization,
    is_deleted: false,
  }).select("_id");
  return students.length === uniqueIds.length
    ? students.map((student) => student._id)
    : null;
};

const getParentPermission = async (organization: ObjectId) => {
  const existing = await PermissionModel.findOne({
    organization,
    name: "Parent Portal",
  });
  if (existing) return existing;
  return PermissionModel.create({
    organization,
    name: "Parent Portal",
    description: "Restricted access to linked children's school information.",
  });
};

export const getAttendanceSummary = async (
  organization: ObjectId,
  studentId: ObjectId,
) => {
  const documents = await AttendanceModel.find({
    organization,
    "records.student": studentId,
  })
    .populate({ path: "class", select: "name" })
    .sort({ date: -1 });
  const history = documents.flatMap((document) => {
    const record = document.records.find(
      (item) => String(item.student) === String(studentId),
    );
    return record
      ? [
          {
            attendance_id: document._id,
            date: document.date,
            session: document.session,
            term: document.term,
            class: document.class,
            status: record.status,
            remark: record.remark ?? "",
          },
        ]
      : [];
  });
  const counts = {
    present: history.filter((item) => item.status === EAttendanceStatus.PRESENT)
      .length,
    absent: history.filter((item) => item.status === EAttendanceStatus.ABSENT)
      .length,
    late: history.filter((item) => item.status === EAttendanceStatus.LATE)
      .length,
    excused: history.filter((item) => item.status === EAttendanceStatus.EXCUSED)
      .length,
  };
  const countableDays = history.length - counts.excused;
  const percentage =
    countableDays === 0
      ? 0
      : Math.round(((counts.present + counts.late) / countableDays) * 10000) /
        100;
  return { total_days: history.length, percentage, counts, history };
};

export const serializePortalInvoice = (invoice: any) => {
  const value = invoice.toObject();
  const balance = Math.max(0, value.total_amount - value.amount_paid);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const displayStatus =
    value.status !== "paid" && new Date(value.due_date).getTime() < today.getTime()
      ? "overdue"
      : value.status;
  return { ...value, balance, display_status: displayStatus };
};

const getFinancialSummary = async (
  organization: ObjectId,
  studentId: ObjectId,
) => {
  const invoices = await InvoiceModel.find({
    organization,
    student: studentId,
  });
  return invoices.reduce(
    (summary, invoice) => ({
      invoiced: summary.invoiced + invoice.total_amount,
      paid: summary.paid + invoice.amount_paid,
      balance:
        summary.balance + Math.max(0, invoice.total_amount - invoice.amount_paid),
    }),
    { invoiced: 0, paid: 0, balance: 0 },
  );
};

export const getLatestResult = async (
  organization: ObjectId,
  studentId: ObjectId,
) => {
  const result = await ResultModel.findOne({
    organization,
    student: studentId,
    $or: [{ status: "approved" }, { status: { $exists: false } }],
  })
    .sort({ createdAt: -1 })
    .select("session term blocks status");
  if (!result) return null;
  const average =
    result.blocks.length === 0
      ? 0
      : Math.round(
          (result.blocks.reduce((sum, block) => sum + block.total, 0) /
            result.blocks.length) *
            100,
        ) / 100;
  return {
    _id: result._id,
    session: result.session,
    term: result.term,
    average,
    status: result.status ?? "approved",
  };
};

const getParentProfile = (accountId: string, organization: ObjectId) =>
  ParentProfileModel.findOne({
    account: new ObjectId(accountId),
    organization,
  });

export const createParentAccount = async (req: Request, res: Response) => {
  let createdAccountId: ObjectId | undefined;
  try {
    const { account } = req;
    const { first_name, last_name, email, password, student_ids } = req.body;
    if (
      typeof first_name !== "string" ||
      !first_name.trim() ||
      typeof last_name !== "string" ||
      !last_name.trim() ||
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      typeof password !== "string" ||
      !PASSWORD_PATTERN.test(password)
    ) {
      return errorResponse(res, 400, "Valid parent account details are required");
    }
    const normalizedEmail = email.trim().toLowerCase();
    if (await AccountModel.exists({ email: normalizedEmail })) {
      return errorResponse(res, 409, "An account with this email already exists");
    }
    const organization = new ObjectId(account.organization_id);
    const children = await validateStudentIds(student_ids, organization);
    if (!children) {
      return errorResponse(res, 400, "Select at least one valid student");
    }
    const permission = await getParentPermission(organization);
    const parentAccount = await AccountModel.create({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: normalizedEmail,
      password: await hash(password, 10),
      organization,
      permission: permission._id,
      access_level: ESystemAccessLevel.NORMAL_USER,
      account_type: EAccountType.PARENT,
      is_email_verified: true,
      is_verified: true,
    });
    createdAccountId = parentAccount._id;
    const profile = await ParentProfileModel.create({
      organization,
      account: parentAccount._id,
      children,
      created_by: new ObjectId(account.account_id),
    });
    return successResponse(res, 201, {
      profile,
      account: {
        _id: parentAccount._id,
        first_name: parentAccount.first_name,
        last_name: parentAccount.last_name,
        email: parentAccount.email,
        account_type: parentAccount.account_type,
      },
    });
  } catch (error: any) {
    if (createdAccountId) await AccountModel.deleteOne({ _id: createdAccountId });
    return errorResponse(res, 500, error.message);
  }
};

export const getParentAccounts = async (req: Request, res: Response) => {
  try {
    const organization = new ObjectId(req.account.organization_id);
    const parents = await ParentProfileModel.find({ organization })
      .populate({ path: "account", select: "first_name last_name email account_type" })
      .populate({
        path: "children",
        select: "registration_number personal_information academic_details.class",
        populate: { path: "academic_details.class", select: "name section other_section" },
      })
      .sort({ createdAt: -1 });
    return successResponse(res, 200, parents);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const updateParentChildren = async (req: Request, res: Response) => {
  try {
    const { parent_id } = req.params;
    if (!ObjectId.isValid(parent_id)) {
      return errorResponse(res, 400, "Invalid parent profile");
    }
    const organization = new ObjectId(req.account.organization_id);
    const children = await validateStudentIds(req.body.student_ids, organization);
    if (!children) return errorResponse(res, 400, "Select valid students");
    const profile = await ParentProfileModel.findOneAndUpdate(
      { _id: new ObjectId(parent_id), organization },
      { $set: { children } },
      { new: true },
    );
    if (!profile) return errorResponse(res, 404, "Parent profile not found");
    return successResponse(res, 200, profile);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getParentDashboard = async (req: Request, res: Response) => {
  try {
    const organization = new ObjectId(req.account.organization_id);
    const profile = await getParentProfile(req.account.account_id, organization);
    if (!profile) return errorResponse(res, 404, "Parent profile not found");
    const students = await StudentModel.find({
      _id: { $in: profile.children },
      organization,
      is_deleted: false,
    })
      .select("registration_number personal_information academic_details is_active")
      .populate({ path: "academic_details.class", select: "name section other_section" });
    const children = await Promise.all(
      students.map(async (student) => {
        const studentId = student._id as ObjectId;
        const [attendance, finances, latestResult] = await Promise.all([
          getAttendanceSummary(organization, studentId),
          getFinancialSummary(organization, studentId),
          getLatestResult(organization, studentId),
        ]);
        return {
          student,
          attendance: {
            total_days: attendance.total_days,
            percentage: attendance.percentage,
            counts: attendance.counts,
          },
          finances,
          latest_result: latestResult,
        };
      }),
    );
    return successResponse(res, 200, { children });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getParentChildDetails = async (req: Request, res: Response) => {
  try {
    const { student_id } = req.params;
    if (!ObjectId.isValid(student_id)) {
      return errorResponse(res, 400, "Invalid student");
    }
    const organization = new ObjectId(req.account.organization_id);
    const profile = await getParentProfile(req.account.account_id, organization);
    if (
      !profile ||
      !profile.children.some((childId: ObjectId) => String(childId) === student_id)
    ) {
      return errorResponse(res, 403, "You do not have access to this student");
    }
    const studentObjectId = new ObjectId(student_id);
    const student = await StudentModel.findOne({
      _id: studentObjectId,
      organization,
      is_deleted: false,
    })
      .select("registration_number personal_information academic_details is_active")
      .populate({ path: "academic_details.class", select: "name section other_section" });
    if (!student) return errorResponse(res, 404, "Student not found");

    const [attendance, invoiceDocuments, payments, results] = await Promise.all([
      getAttendanceSummary(organization, studentObjectId),
      InvoiceModel.find({ organization, student: studentObjectId })
        .populate({ path: "fee_structure", select: "name" })
        .sort({ createdAt: -1 }),
      PaymentModel.find({ organization, student: studentObjectId })
        .select("invoice amount method reference receipt_number paid_at provider channel")
        .sort({ paid_at: -1 }),
      ResultModel.find({
        organization,
        student: studentObjectId,
        $or: [{ status: "approved" }, { status: { $exists: false } }],
      })
        .populate({ path: "blocks.subject", select: "name" })
        .sort({ createdAt: -1 }),
    ]);
    const invoices = invoiceDocuments.map((invoice) => {
      const serialized = serializePortalInvoice(invoice);
      return {
        ...serialized,
        payment_url:
          serialized.balance > 0
            ? createInvoicePaymentUrl(String(invoice._id))
            : undefined,
      };
    });
    const finances = invoices.reduce(
      (summary, invoice) => ({
        invoiced: summary.invoiced + invoice.total_amount,
        paid: summary.paid + invoice.amount_paid,
        balance: summary.balance + invoice.balance,
      }),
      { invoiced: 0, paid: 0, balance: 0 },
    );
    return successResponse(res, 200, {
      student,
      attendance,
      finances,
      invoices,
      payments,
      results,
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
