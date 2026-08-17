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
import { checkPathPermission } from "../middlewares/checkPathPermission";

const router = Router();

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
