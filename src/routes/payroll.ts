import { Router } from "express";
import { auth } from "../auth/auth";
import {
  getAllPayroll,
  generatePayroll,
  getPayrollById,
  updatePayrollById,
  deletePayrollById,
} from "../controllers/payroll.controller";
import { checkPathPermission } from "../middlewares/checkPathPermission";
import { payrollValidator } from "../validators/payroll.validator";

const router = Router();

router.get("/", auth, checkPathPermission, getAllPayroll);

router.post(
  "/",
  auth,
  checkPathPermission,
  payrollValidator.generatePayroll,
  generatePayroll
);

router.get("/:id", auth, checkPathPermission, getPayrollById);

router.put(
  "/:id",
  auth,
  checkPathPermission,
  payrollValidator.updatePayroll,
  updatePayrollById
);

router.delete("/:id", auth, checkPathPermission, deletePayrollById);

export default router;
