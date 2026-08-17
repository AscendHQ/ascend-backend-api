import { hash } from "bcryptjs";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import { EAccountType, ESystemAccessLevel } from "../interface";
import AccountModel from "../models/account";
import InvoiceModel from "../models/invoice";
import PaymentModel from "../models/payment";
import PermissionModel from "../models/permission";
import ResultModel from "../models/result";
import StudentModel from "../models/student";
import StudentProfileModel from "../models/student_profile";
import { errorResponse, successResponse } from "../utils/responseHandler";
import { createInvoicePaymentUrl } from "./paystack.controller";
import {
  getAttendanceSummary,
  getLatestResult,
  serializePortalInvoice,
} from "./parent.controller";

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/;

const getStudentPermission = async (organization: ObjectId) => {
  const existing = await PermissionModel.findOne({
    organization,
    name: "Student Portal",
  });
  return (
    existing ??
    PermissionModel.create({
      organization,
      name: "Student Portal",
      description: "Restricted access to the student's own school information.",
    })
  );
};

export const createStudentPortalAccount = async (
  req: Request,
  res: Response,
) => {
  let createdAccountId: ObjectId | undefined;
  try {
    const { student_id, password } = req.body;
    if (
      !ObjectId.isValid(student_id) ||
      typeof password !== "string" ||
      !PASSWORD_PATTERN.test(password)
    ) {
      return errorResponse(res, 400, "Valid student portal details are required");
    }
    const organization = new ObjectId(req.account.organization_id);
    const student = await StudentModel.findOne({
      _id: new ObjectId(student_id),
      organization,
      is_deleted: false,
    }).select("personal_information registration_number");
    if (!student) return errorResponse(res, 404, "Student not found");
    if (await StudentProfileModel.exists({ organization, student: student._id })) {
      return errorResponse(res, 409, "This student already has a portal account");
    }
    const loginId = student.registration_number.trim().toLowerCase();
    if (await AccountModel.exists({ login_id: loginId })) {
      return errorResponse(res, 409, "This registration number already has an account");
    }
    const permission = await getStudentPermission(organization);
    const portalAccount = await AccountModel.create({
      first_name: student.personal_information.first_name,
      last_name: student.personal_information.last_name,
      email: `student-${student._id}@portal.ascend.invalid`,
      login_id: loginId,
      password: await hash(password, 10),
      organization,
      permission: permission._id,
      access_level: ESystemAccessLevel.NORMAL_USER,
      account_type: EAccountType.STUDENT,
      is_email_verified: true,
      is_verified: true,
    });
    createdAccountId = portalAccount._id;
    const profile = await StudentProfileModel.create({
      organization,
      account: portalAccount._id,
      student: student._id,
      created_by: new ObjectId(req.account.account_id),
    });
    return successResponse(res, 201, {
      profile,
      login_id: student.registration_number,
    });
  } catch (error: any) {
    if (createdAccountId) await AccountModel.deleteOne({ _id: createdAccountId });
    return errorResponse(res, 500, error.message);
  }
};

export const getStudentPortalAccounts = async (req: Request, res: Response) => {
  try {
    const profiles = await StudentProfileModel.find({
      organization: new ObjectId(req.account.organization_id),
    })
      .populate({ path: "account", select: "first_name last_name login_id account_type" })
      .populate({
        path: "student",
        select: "registration_number personal_information academic_details.class",
        populate: { path: "academic_details.class", select: "name section other_section" },
      })
      .sort({ createdAt: -1 });
    return successResponse(res, 200, profiles);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getStudentPortalDashboard = async (
  req: Request,
  res: Response,
) => {
  try {
    const organization = new ObjectId(req.account.organization_id);
    const profile = await StudentProfileModel.findOne({
      account: new ObjectId(req.account.account_id),
      organization,
    });
    if (!profile) return errorResponse(res, 404, "Student profile not found");
    const studentObjectId = profile.student as ObjectId;
    const student = await StudentModel.findOne({
      _id: studentObjectId,
      organization,
      is_deleted: false,
    })
      .select("registration_number personal_information academic_details is_active")
      .populate({ path: "academic_details.class", select: "name section other_section" });
    if (!student) return errorResponse(res, 404, "Student not found");
    const [attendance, invoiceDocuments, payments, results, latestResult] =
      await Promise.all([
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
        getLatestResult(organization, studentObjectId),
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
      latest_result: latestResult,
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
