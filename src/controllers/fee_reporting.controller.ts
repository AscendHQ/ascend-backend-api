import { Request, Response } from "express";
import { ObjectId } from "mongodb";

import InvoiceModel from "../models/invoice";
import { errorResponse, successResponse } from "../utils/responseHandler";

const TERMS = ["1st Term", "2nd Term", "3rd Term"];

const periodRank = (session: string, term: string) => {
  const firstYear = Number(session.split("/")[0]);
  return firstYear * TERMS.length + TERMS.indexOf(term);
};

const money = (value: number) => Math.round(value * 100) / 100;

const studentName = (student: any) =>
  [
    student?.personal_information?.first_name,
    student?.personal_information?.middle_name,
    student?.personal_information?.last_name,
  ]
    .filter(Boolean)
    .join(" ");

type StudentBalance = {
  student: any;
  current_expected: number;
  current_paid: number;
  current_balance: number;
  arrears_balance: number;
  arrears_sources: Map<string, number>;
};

const createStudentBalance = (student: any): StudentBalance => ({
  student,
  current_expected: 0,
  current_paid: 0,
  current_balance: 0,
  arrears_balance: 0,
  arrears_sources: new Map<string, number>(),
});

const addInvoiceToStudent = (
  account: StudentBalance,
  invoice: any,
  selectedRank: number,
) => {
  const balance = Math.max(0, invoice.total_amount - invoice.amount_paid);
  const rank = periodRank(invoice.session, invoice.term);
  if (rank === selectedRank) {
    account.current_expected += invoice.total_amount;
    account.current_paid += invoice.amount_paid;
    account.current_balance += balance;
    return;
  }
  if (rank < selectedRank && balance > 0) {
    account.arrears_balance += balance;
    const key = `${invoice.session}, ${invoice.term}`;
    account.arrears_sources.set(
      key,
      (account.arrears_sources.get(key) ?? 0) + balance,
    );
  }
};

const serializeStudentBalance = (account: StudentBalance) => ({
  student: account.student,
  current_expected: money(account.current_expected),
  current_paid: money(account.current_paid),
  current_balance: money(account.current_balance),
  arrears_balance: money(account.arrears_balance),
  total_outstanding: money(account.current_balance + account.arrears_balance),
  arrears_sources: Array.from(account.arrears_sources.entries())
    .map(([period, amount]) => ({ period, amount: money(amount) }))
    .sort((a, b) => b.period.localeCompare(a.period)),
});

export const getFeeFinancialOverview = async (req: Request, res: Response) => {
  try {
    const { session, term, class_id } = req.query;
    if (
      typeof session !== "string" ||
      !/^\d{4}\/\d{4}$/.test(session) ||
      typeof term !== "string" ||
      !TERMS.includes(term) ||
      (class_id !== undefined && !ObjectId.isValid(String(class_id)))
    ) {
      return errorResponse(res, 400, "Valid session and term are required");
    }

    const organization = new ObjectId(req.account.organization_id);
    const query: Record<string, unknown> = { organization };
    if (class_id) query.class = new ObjectId(String(class_id));
    const invoices = await InvoiceModel.find(query)
      .populate({
        path: "student",
        select: "registration_number personal_information",
      })
      .select(
        "student session term total_amount amount_paid status invoice_number class",
      )
      .lean();
    const selectedRank = periodRank(session, term);
    const accounts = new Map<string, StudentBalance>();

    invoices.forEach((invoice: any) => {
      if (!invoice.student?._id) return;
      const id = String(invoice.student._id);
      const account =
        accounts.get(id) ?? createStudentBalance(invoice.student);
      addInvoiceToStudent(account, invoice, selectedRank);
      accounts.set(id, account);
    });

    const students = Array.from(accounts.values())
      .map(serializeStudentBalance)
      .filter(
        (account) =>
          account.current_expected > 0 || account.arrears_balance > 0,
      )
      .sort((a, b) =>
        studentName(a.student).localeCompare(studentName(b.student)),
      );
    const summary = students.reduce(
      (total, account) => {
        total.expected += account.current_expected;
        total.collected += account.current_paid;
        total.current_outstanding += account.current_balance;
        total.previous_arrears += account.arrears_balance;
        total.total_receivable += account.total_outstanding;
        if (account.current_expected > 0) {
          if (account.current_balance === 0) total.fully_paid += 1;
          else if (account.current_paid > 0) total.partially_paid += 1;
          else total.unpaid += 1;
        }
        return total;
      },
      {
        expected: 0,
        collected: 0,
        current_outstanding: 0,
        previous_arrears: 0,
        total_receivable: 0,
        fully_paid: 0,
        partially_paid: 0,
        unpaid: 0,
      },
    );
    const roundedSummary = {
      ...summary,
      expected: money(summary.expected),
      collected: money(summary.collected),
      current_outstanding: money(summary.current_outstanding),
      previous_arrears: money(summary.previous_arrears),
      total_receivable: money(summary.total_receivable),
      collection_rate:
        summary.expected > 0
          ? Math.round((summary.collected / summary.expected) * 1000) / 10
          : 0,
    };

    return successResponse(res, 200, {
      session,
      term,
      summary: roundedSummary,
      students,
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};
