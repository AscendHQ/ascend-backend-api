import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { nanoid } from "nanoid";

import { EInvoiceStatus, EPaymentMethod, IFeeItem } from "../interface";
import ClassModel from "../models/class";
import FeeStructureModel from "../models/fee_structure";
import InvoiceModel from "../models/invoice";
import PaymentModel from "../models/payment";
import StudentModel from "../models/student";
import { errorResponse, successResponse } from "../utils/responseHandler";

const VALID_TERMS = ["1st Term", "2nd Term", "3rd Term"];
const VALID_METHODS = Object.values(EPaymentMethod);

const isValidPeriod = (session: unknown, term: unknown) =>
  typeof session === "string" &&
  /^\d{4}\/\d{4}$/.test(session) &&
  typeof term === "string" &&
  VALID_TERMS.includes(term);

const normalizeItems = (items: unknown): IFeeItem[] | null => {
  if (!Array.isArray(items) || items.length === 0) return null;
  const normalized = items.map((item) => ({
    label: typeof item?.label === "string" ? item.label.trim() : "",
    amount: Number(item?.amount),
  }));
  const labels = normalized.map((item) => item.label.toLowerCase());
  const invalid = normalized.some(
    (item) =>
      !item.label ||
      item.label.length > 100 ||
      !Number.isFinite(item.amount) ||
      item.amount <= 0,
  );
  if (invalid || new Set(labels).size !== labels.length) return null;
  return normalized;
};

const getRosterQuery = (
  organization: ObjectId,
  classId: ObjectId,
  session: string,
  term: string,
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

const getDisplayStatus = (invoice: {
  status: EInvoiceStatus;
  due_date: Date;
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return invoice.status !== EInvoiceStatus.PAID &&
    new Date(invoice.due_date).getTime() < today.getTime()
    ? "overdue"
    : invoice.status;
};

const serializeInvoice = (invoice: any) => {
  const value = invoice.toObject ? invoice.toObject() : invoice;
  return {
    ...value,
    balance: Math.max(0, value.total_amount - value.amount_paid),
    display_status: getDisplayStatus(value),
  };
};

const generateInvoicesForStructure = async (
  structure: any,
  organization: ObjectId,
) => {
  const classObjectId = new ObjectId(String(structure.class));
  const students = await StudentModel.find(
    getRosterQuery(
      organization,
      classObjectId,
      structure.session,
      structure.term,
    ),
  ).select("_id");
  if (students.length === 0) return 0;
  const result = await InvoiceModel.bulkWrite(
    students.map((student) => ({
      updateOne: {
        filter: {
          organization,
          student: student._id,
          fee_structure: structure._id,
        },
        update: {
          $setOnInsert: {
            organization,
            fee_structure: structure._id,
            student: student._id,
            class: classObjectId,
            session: structure.session,
            term: structure.term,
            invoice_number: `INV-${nanoid(10).toUpperCase()}`,
            items: structure.items,
            total_amount: structure.total_amount,
            amount_paid: 0,
            status: EInvoiceStatus.UNPAID,
            due_date: structure.due_date,
          },
        },
        upsert: true,
      },
    })),
  );
  return result.upsertedCount;
};

export const createFeeStructure = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { name, class_id, session, term, items, due_date } = req.body;
    const normalizedItems = normalizeItems(items);
    const dueDate = new Date(due_date);

    if (
      typeof name !== "string" ||
      !name.trim() ||
      name.trim().length > 120 ||
      !ObjectId.isValid(class_id) ||
      !isValidPeriod(session, term) ||
      !normalizedItems ||
      Number.isNaN(dueDate.getTime())
    ) {
      return errorResponse(res, 400, "Valid fee structure details are required");
    }

    const organization = new ObjectId(account.organization_id);
    const classObjectId = new ObjectId(class_id);
    const classRecord = await ClassModel.exists({
      _id: classObjectId,
      organization,
      is_active: true,
    });
    if (!classRecord) return errorResponse(res, 404, "Class not found");

    const totalAmount =
      Math.round(
        normalizedItems.reduce((total, item) => total + item.amount, 0) * 100,
      ) / 100;
    const structure = await FeeStructureModel.create({
      organization,
      name: name.trim(),
      class: classObjectId,
      session,
      term,
      items: normalizedItems,
      total_amount: totalAmount,
      due_date: dueDate,
      created_by: new ObjectId(account.account_id),
    });

    const invoicesCreated = await generateInvoicesForStructure(
      structure,
      organization,
    );

    return successResponse(res, 201, {
      structure,
      invoices_created: invoicesCreated,
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return errorResponse(
        res,
        409,
        "A fee structure with this name already exists for the class and period",
      );
    }
    return errorResponse(res, 500, error.message);
  }
};

export const generateMissingInvoices = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { structure_id } = req.params;
    if (!ObjectId.isValid(structure_id)) {
      return errorResponse(res, 400, "Invalid fee structure");
    }
    const organization = new ObjectId(account.organization_id);
    const structure = await FeeStructureModel.findOne({
      _id: new ObjectId(structure_id),
      organization,
      is_active: true,
    });
    if (!structure) return errorResponse(res, 404, "Fee structure not found");
    const invoicesCreated = await generateInvoicesForStructure(
      structure,
      organization,
    );
    return successResponse(res, 200, { invoices_created: invoicesCreated });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getFeeStructures = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { session, term, class_id } = req.query;
    const query: Record<string, unknown> = {
      organization: new ObjectId(account.organization_id),
      is_active: true,
    };
    if (session) query.session = session;
    if (term) query.term = term;
    if (class_id && ObjectId.isValid(class_id as string)) {
      query.class = new ObjectId(class_id as string);
    }

    const structures = await FeeStructureModel.find(query)
      .populate({ path: "class", select: "name level section other_section" })
      .sort({ createdAt: -1 });
    const response = await Promise.all(
      structures.map(async (structure) => ({
        ...structure.toObject(),
        invoice_count: await InvoiceModel.countDocuments({
          organization: query.organization,
          fee_structure: structure._id,
        }),
      })),
    );
    return successResponse(res, 200, response);
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { session, term, class_id, status } = req.query;
    const query: Record<string, unknown> = {
      organization: new ObjectId(account.organization_id),
    };
    if (session) query.session = session;
    if (term) query.term = term;
    if (class_id && ObjectId.isValid(class_id as string)) {
      query.class = new ObjectId(class_id as string);
    }

    const documents = await InvoiceModel.find(query)
      .populate({
        path: "student",
        select: "registration_number personal_information guardian_information",
      })
      .populate({ path: "class", select: "name level section other_section" })
      .populate({ path: "fee_structure", select: "name" })
      .sort({ createdAt: -1 });
    const allInvoices = documents.map(serializeInvoice);
    const invoices = status
      ? allInvoices.filter((invoice) => invoice.display_status === status)
      : allInvoices;
    const summary = allInvoices.reduce(
      (totals, invoice) => ({
        invoiced: totals.invoiced + invoice.total_amount,
        collected: totals.collected + invoice.amount_paid,
        outstanding: totals.outstanding + invoice.balance,
        paid: totals.paid + Number(invoice.display_status === "paid"),
        partial: totals.partial + Number(invoice.display_status === "partial"),
        unpaid: totals.unpaid + Number(invoice.display_status === "unpaid"),
        overdue: totals.overdue + Number(invoice.display_status === "overdue"),
      }),
      {
        invoiced: 0,
        collected: 0,
        outstanding: 0,
        paid: 0,
        partial: 0,
        unpaid: 0,
        overdue: 0,
      },
    );

    return successResponse(res, 200, { invoices, summary });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { invoice_id } = req.params;
    if (!ObjectId.isValid(invoice_id)) {
      return errorResponse(res, 400, "Invalid invoice");
    }
    const organization = new ObjectId(account.organization_id);
    const invoice = await InvoiceModel.findOne({
      _id: new ObjectId(invoice_id),
      organization,
    })
      .populate({
        path: "student",
        select: "registration_number personal_information guardian_information",
      })
      .populate({ path: "class", select: "name level section other_section" })
      .populate({ path: "fee_structure", select: "name" });
    if (!invoice) return errorResponse(res, 404, "Invoice not found");
    const payments = await PaymentModel.find({
      organization,
      invoice: invoice._id,
    }).sort({ paid_at: -1 });
    return successResponse(res, 200, {
      invoice: serializeInvoice(invoice),
      payments,
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const recordInvoicePayment = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { invoice_id } = req.params;
    const { amount, method, reference, note, paid_at } = req.body;
    const paymentAmount = Number(amount);
    const paidAt = paid_at ? new Date(paid_at) : new Date();
    if (
      !ObjectId.isValid(invoice_id) ||
      !Number.isFinite(paymentAmount) ||
      paymentAmount < 0.01 ||
      !VALID_METHODS.includes(method) ||
      Number.isNaN(paidAt.getTime()) ||
      paidAt.getTime() > Date.now() ||
      (note !== undefined && (typeof note !== "string" || note.length > 250))
    ) {
      return errorResponse(res, 400, "Valid payment details are required");
    }

    const organization = new ObjectId(account.organization_id);
    const invoice = await InvoiceModel.findOne({
      _id: new ObjectId(invoice_id),
      organization,
    });
    if (!invoice) return errorResponse(res, 404, "Invoice not found");
    const balance = invoice.total_amount - invoice.amount_paid;
    if (paymentAmount > balance) {
      return errorResponse(res, 400, "Payment cannot exceed the invoice balance");
    }

    const updatedInvoice = await InvoiceModel.findOneAndUpdate(
      {
        _id: invoice._id,
        organization,
        amount_paid: { $lte: invoice.total_amount - paymentAmount },
      },
      { $inc: { amount_paid: paymentAmount } },
      { new: true, runValidators: true },
    );
    if (!updatedInvoice) {
      return errorResponse(res, 409, "The invoice balance has changed; try again");
    }

    const nextStatus =
      updatedInvoice.amount_paid >= updatedInvoice.total_amount
        ? EInvoiceStatus.PAID
        : EInvoiceStatus.PARTIAL;
    updatedInvoice.status = nextStatus;
    await updatedInvoice.save();

    try {
      const payment = await PaymentModel.create({
        organization,
        invoice: invoice._id,
        student: invoice.student,
        amount: paymentAmount,
        method,
        reference:
          typeof reference === "string" && reference.trim()
            ? reference.trim()
            : `MANUAL-${nanoid(12).toUpperCase()}`,
        receipt_number: `RCT-${nanoid(10).toUpperCase()}`,
        note: typeof note === "string" ? note.trim() : undefined,
        paid_at: paidAt,
        recorded_by: new ObjectId(account.account_id),
      });
      return successResponse(res, 201, {
        payment,
        invoice: serializeInvoice(updatedInvoice),
      });
    } catch (error) {
      await InvoiceModel.updateOne(
        { _id: invoice._id, organization },
        {
          $inc: { amount_paid: -paymentAmount },
          $set: { status: invoice.status },
        },
      );
      throw error;
    }
  } catch (error: any) {
    if (error?.code === 11000) {
      return errorResponse(res, 409, "This payment reference has already been used");
    }
    return errorResponse(res, 500, error.message);
  }
};

export const getStudentFinances = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { student_id } = req.params;
    if (!ObjectId.isValid(student_id)) {
      return errorResponse(res, 400, "Invalid student");
    }
    const organization = new ObjectId(account.organization_id);
    const studentObjectId = new ObjectId(student_id);
    const student = await StudentModel.exists({
      _id: studentObjectId,
      organization,
      is_deleted: false,
    });
    if (!student) return errorResponse(res, 404, "Student not found");

    const [invoiceDocuments, payments] = await Promise.all([
      InvoiceModel.find({ organization, student: studentObjectId })
        .populate({ path: "class", select: "name level section other_section" })
        .populate({ path: "fee_structure", select: "name" })
        .sort({ createdAt: -1 }),
      PaymentModel.find({ organization, student: studentObjectId }).sort({
        paid_at: -1,
      }),
    ]);
    const invoices = invoiceDocuments.map(serializeInvoice);
    const summary = invoices.reduce(
      (totals, invoice) => ({
        invoiced: totals.invoiced + invoice.total_amount,
        paid: totals.paid + invoice.amount_paid,
        balance: totals.balance + invoice.balance,
      }),
      { invoiced: 0, paid: 0, balance: 0 },
    );
    return successResponse(res, 200, { summary, invoices, payments });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
