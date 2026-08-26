import { Router } from "express";

import { auth } from "../auth/auth";
import {
  createFeeStructure,
  generateMissingInvoices,
  getFeeStructures,
  getInvoiceById,
  getInvoices,
  getStudentFinances,
  recordInvoicePayment,
} from "../controllers/fee.controller";
import { getFeeFinancialOverview } from "../controllers/fee_reporting.controller";
import { checkPathPermission } from "../middlewares/checkPathPermission";
import {
  createInvoicePaymentLink,
  getPublicInvoice,
  handlePaystackWebhook,
  initializePaystackPayment,
  verifyPaystackPayment,
} from "../controllers/paystack.controller";

const router = Router();

router.post("/paystack/webhook", handlePaystackWebhook);
router.get("/public/invoices/:token", getPublicInvoice);
router.post("/public/invoices/:token/initialize", initializePaystackPayment);
router.get("/public/payments/:reference/verify", verifyPaystackPayment);

router.get("/overview", auth, checkPathPermission, getFeeFinancialOverview);
router.get("/structures", auth, checkPathPermission, getFeeStructures);
router.post("/structures", auth, checkPathPermission, createFeeStructure);
router.post(
  "/structures/:structure_id/generate-invoices",
  auth,
  checkPathPermission,
  generateMissingInvoices,
);
router.get("/invoices", auth, checkPathPermission, getInvoices);
router.get("/invoices/:invoice_id", auth, checkPathPermission, getInvoiceById);
router.post(
  "/invoices/:invoice_id/payment-link",
  auth,
  checkPathPermission,
  createInvoicePaymentLink,
);
router.post(
  "/invoices/:invoice_id/payments",
  auth,
  checkPathPermission,
  recordInvoicePayment,
);
router.get(
  "/students/:student_id",
  auth,
  checkPathPermission,
  getStudentFinances,
);

export default router;
