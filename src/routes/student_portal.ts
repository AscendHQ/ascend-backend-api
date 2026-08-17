import { Router } from "express";

import { auth } from "../auth/auth";
import {
  createStudentPortalAccount,
  getStudentPortalAccounts,
  getStudentPortalDashboard,
} from "../controllers/student_portal.controller";
import { EAccountType } from "../interface";
import { hasAdministrationAccess } from "../middlewares/hasAdministrationAccess";
import { requireAccountType } from "../middlewares/requireAccountType";

const router = Router();
router.get(
  "/me/dashboard",
  auth,
  requireAccountType(EAccountType.STUDENT),
  getStudentPortalDashboard,
);
router.get("/", auth, hasAdministrationAccess, getStudentPortalAccounts);
router.post("/", auth, hasAdministrationAccess, createStudentPortalAccount);
export default router;
