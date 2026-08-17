import axios from "axios";
import crypto from "crypto";
import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { nanoid } from "nanoid";

import { config } from "../config/env";
import { EInvoiceStatus, EPaymentMethod } from "../interface";
import InvoiceModel from "../models/invoice";
import PaymentModel from "../models/payment";
import PaymentAttemptModel from "../models/payment_attempt";
import { errorResponse, successResponse } from "../utils/responseHandler";

const PAYSTACK_API = "https://api.paystack.co";
const PAYMENT_LINK_LIFETIME_SECONDS = 30 * 24 * 60 * 60;

type PaymentLinkPayload = { invoiceId: string; exp: number };
type PaystackTransaction = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string;
  channel?: string;
  customer?: { email?: string };
};

const signPayload = (encodedPayload: string) =>
  crypto
    .createHmac("sha256", config.PAYMENT_LINK_SECRET)
    .update(encodedPayload)
    .digest("hex");

const createPaymentToken = (invoiceId: string) => {
  const payload: PaymentLinkPayload = {
    invoiceId,
    exp: Math.floor(Date.now() / 1000) + PAYMENT_LINK_LIFETIME_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
};

export const createInvoicePaymentUrl = (invoiceId: string) => {
  const token = createPaymentToken(invoiceId);
  return `${config.FRONTEND_APP_URL.replace(/\/$/, "")}/pay/${token}`;
};

const parsePaymentToken = (token: string): PaymentLinkPayload | null => {
  try {
    const [encodedPayload, providedSignature] = token.split(".");
    if (!encodedPayload || !providedSignature) return null;
    const expectedSignature = signPayload(encodedPayload);
    const expectedBuffer = Buffer.from(expectedSignature);
    const providedBuffer = Buffer.from(providedSignature);
    if (
      expectedBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      return null;
    }
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as PaymentLinkPayload;
    if (
      !ObjectId.isValid(payload.invoiceId) ||
      !Number.isFinite(payload.exp) ||
      payload.exp < Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return payload;
  } catch (_error) {
    return null;
  }
};

const findPublicInvoice = async (token: string) => {
  const payload = parsePaymentToken(token);
  if (!payload) return null;
  return InvoiceModel.findById(payload.invoiceId)
    .populate({ path: "organization", select: "name organization_logo" })
    .populate({
      path: "student",
      select: "registration_number personal_information",
    })
    .populate({ path: "class", select: "name level section other_section" })
    .populate({ path: "fee_structure", select: "name" });
};

const serializePublicInvoice = (invoice: any) => {
  const value = invoice.toObject();
  const balance = Math.max(0, value.total_amount - value.amount_paid);
  return {
    _id: value._id,
    invoice_number: value.invoice_number,
    school: value.organization,
    fee_structure: value.fee_structure,
    student: value.student,
    class: value.class,
    session: value.session,
    term: value.term,
    items: value.items,
    total_amount: value.total_amount,
    amount_paid: value.amount_paid,
    balance,
    status: value.status,
    due_date: value.due_date,
    createdAt: value.createdAt,
  };
};

const getPaystackHeaders = () => ({
  Authorization: `Bearer ${config.PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
});

const ensurePaystackConfigured = (res: Response) => {
  if (config.PAYSTACK_SECRET_KEY) return true;
  errorResponse(res, 503, "Online payments are not configured yet");
  return false;
};

const markAttemptFailed = (reference: string, reason: string) =>
  PaymentAttemptModel.updateOne(
    { reference, status: "pending" },
    { $set: { status: "failed", failure_reason: reason } },
  );

const finalizeOnlinePayment = async (transaction: PaystackTransaction) => {
  const attempt = await PaymentAttemptModel.findOne({
    reference: transaction.reference,
  });
  if (!attempt) throw new Error("Payment attempt not found");

  const existingPayment = await PaymentModel.findOne({
    organization: attempt.organization,
    reference: transaction.reference,
  });
  if (existingPayment) {
    if (attempt.status !== "successful") {
      attempt.status = "successful";
      attempt.gateway_response = transaction;
      await attempt.save();
    }
    return existingPayment;
  }

  const receivedAmount = transaction.amount / 100;
  if (
    transaction.status !== "success" ||
    transaction.currency !== "NGN" ||
    Math.round(receivedAmount * 100) !== Math.round(attempt.amount * 100)
  ) {
    await markAttemptFailed(transaction.reference, "Verification details did not match");
    throw new Error("Payment verification failed");
  }

  const invoice = await InvoiceModel.findOne({
    _id: attempt.invoice,
    organization: attempt.organization,
  });
  if (!invoice) throw new Error("Invoice not found");
  const balance = Math.max(0, invoice.total_amount - invoice.amount_paid);
  if (balance === 0) {
    attempt.status = "needs_review";
    attempt.failure_reason = "Invoice was already fully paid";
    attempt.gateway_response = transaction;
    await attempt.save();
    throw new Error("Invoice was already fully paid");
  }

  const appliedAmount = Math.min(receivedAmount, balance);
  const updatedInvoice = await InvoiceModel.findOneAndUpdate(
    {
      _id: invoice._id,
      organization: attempt.organization,
      amount_paid: invoice.amount_paid,
    },
    { $inc: { amount_paid: appliedAmount } },
    { new: true, runValidators: true },
  );
  if (!updatedInvoice) throw new Error("Invoice balance changed during payment");
  updatedInvoice.status =
    updatedInvoice.amount_paid >= updatedInvoice.total_amount
      ? EInvoiceStatus.PAID
      : EInvoiceStatus.PARTIAL;
  await updatedInvoice.save();

  let payment;
  try {
    payment = await PaymentModel.create({
      organization: attempt.organization,
      invoice: invoice._id,
      student: attempt.student,
      amount: receivedAmount,
      method: EPaymentMethod.ONLINE,
      reference: transaction.reference,
      receipt_number: `RCT-${nanoid(10).toUpperCase()}`,
      note:
        receivedAmount > appliedAmount
          ? `Online payment includes an overpayment of ${receivedAmount - appliedAmount}`
          : "Paystack online payment",
      paid_at: transaction.paid_at ? new Date(transaction.paid_at) : new Date(),
      provider: "paystack",
      channel: transaction.channel,
    });
  } catch (error) {
    await InvoiceModel.updateOne(
      { _id: invoice._id, organization: attempt.organization },
      {
        $inc: { amount_paid: -appliedAmount },
        $set: { status: invoice.status },
      },
    );
    throw error;
  }
  attempt.status = "successful";
  attempt.gateway_response = transaction;
  await attempt.save();
  return payment;
};

export const createInvoicePaymentLink = async (req: Request, res: Response) => {
  try {
    const { account } = req;
    const { invoice_id } = req.params;
    if (!ObjectId.isValid(invoice_id)) {
      return errorResponse(res, 400, "Invalid invoice");
    }
    const invoice = await InvoiceModel.exists({
      _id: new ObjectId(invoice_id),
      organization: new ObjectId(account.organization_id),
    });
    if (!invoice) return errorResponse(res, 404, "Invoice not found");
    const paymentUrl = createInvoicePaymentUrl(invoice_id);
    return successResponse(res, 200, {
      payment_url: paymentUrl,
      expires_at: new Date(Date.now() + PAYMENT_LINK_LIFETIME_SECONDS * 1000),
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getPublicInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await findPublicInvoice(req.params.token);
    if (!invoice) {
      return errorResponse(res, 404, "This payment link is invalid or has expired");
    }
    const payments = await PaymentModel.find({
      organization: invoice.organization,
      invoice: invoice._id,
    })
      .select("amount reference receipt_number method paid_at provider channel")
      .sort({ paid_at: -1 });
    return successResponse(res, 200, {
      invoice: serializePublicInvoice(invoice),
      payments,
      online_payments_available: Boolean(config.PAYSTACK_SECRET_KEY),
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const initializePaystackPayment = async (req: Request, res: Response) => {
  let reference = "";
  try {
    if (!ensurePaystackConfigured(res)) return;
    const invoice = await findPublicInvoice(req.params.token);
    if (!invoice) {
      return errorResponse(res, 404, "This payment link is invalid or has expired");
    }
    const { email, amount } = req.body;
    const paymentAmount = Number(amount);
    const balance = invoice.total_amount - invoice.amount_paid;
    const amountInKobo = paymentAmount * 100;
    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !Number.isFinite(paymentAmount) ||
      paymentAmount < 0.01 ||
      paymentAmount > balance ||
      Math.abs(amountInKobo - Math.round(amountInKobo)) > 0.000001
    ) {
      return errorResponse(res, 400, "A valid email and payment amount are required");
    }

    reference = `ASC-${nanoid(18).toUpperCase()}`;
    const attempt = await PaymentAttemptModel.create({
      organization: invoice.organization,
      invoice: invoice._id,
      student: invoice.student,
      reference,
      amount: paymentAmount,
      email: email.trim(),
    });
    const callbackUrl = `${config.FRONTEND_APP_URL.replace(
      /\/$/,
      "",
    )}/pay/callback?token=${encodeURIComponent(req.params.token)}`;
    const paystackResponse = await axios.post(
      `${PAYSTACK_API}/transaction/initialize`,
      {
        email: email.trim(),
        amount: Math.round(amountInKobo),
        currency: "NGN",
        reference,
        callback_url: callbackUrl,
        metadata: {
          invoice_id: String(invoice._id),
          invoice_number: invoice.invoice_number,
        },
      },
      { headers: getPaystackHeaders(), timeout: 20000 },
    );
    const data = paystackResponse.data?.data;
    if (!paystackResponse.data?.status || !data?.authorization_url) {
      throw new Error("Paystack did not return a checkout URL");
    }
    attempt.authorization_url = data.authorization_url;
    attempt.access_code = data.access_code;
    await attempt.save();
    return successResponse(res, 200, {
      authorization_url: data.authorization_url,
      reference,
    });
  } catch (error: any) {
    if (reference) await markAttemptFailed(reference, "Initialization failed");
    return errorResponse(
      res,
      502,
      error?.response?.data?.message ?? "Payment could not be initialized",
    );
  }
};

export const verifyPaystackPayment = async (req: Request, res: Response) => {
  try {
    if (!ensurePaystackConfigured(res)) return;
    const { reference } = req.params;
    const payload = parsePaymentToken(String(req.query.token ?? ""));
    if (!payload) return errorResponse(res, 401, "Invalid payment link");
    const attempt = await PaymentAttemptModel.findOne({ reference });
    if (!attempt || String(attempt.invoice) !== payload.invoiceId) {
      return errorResponse(res, 404, "Payment attempt not found");
    }
    const paystackResponse = await axios.get(
      `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: getPaystackHeaders(), timeout: 20000 },
    );
    const transaction = paystackResponse.data?.data as PaystackTransaction;
    const payment = await finalizeOnlinePayment(transaction);
    return successResponse(res, 200, {
      status: "success",
      receipt_number: payment.receipt_number,
      invoice_id: payload.invoiceId,
    });
  } catch (error: any) {
    return errorResponse(
      res,
      400,
      error?.response?.data?.message ?? error.message ?? "Payment verification failed",
    );
  }
};

export const handlePaystackWebhook = async (req: Request, res: Response) => {
  try {
    if (!config.PAYSTACK_SECRET_KEY) return res.sendStatus(503);
    const signature = req.headers["x-paystack-signature"];
    const rawBody = (req as any).rawBody as Buffer | undefined;
    if (typeof signature !== "string" || !rawBody) return res.sendStatus(401);
    const expectedSignature = crypto
      .createHmac("sha512", config.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");
    const expectedBuffer = Buffer.from(expectedSignature);
    const providedBuffer = Buffer.from(signature);
    if (
      expectedBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      return res.sendStatus(401);
    }
    if (req.body?.event === "charge.success") {
      await finalizeOnlinePayment(req.body.data as PaystackTransaction);
    }
    return res.sendStatus(200);
  } catch (_error) {
    return res.sendStatus(500);
  }
};
