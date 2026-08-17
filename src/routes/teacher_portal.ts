import { Router } from "express";

import { auth } from "../auth/auth";
import {
  createTeacherPortalAccount,
  getTeacherPortalAccounts,
  getTeacherPortalDashboard,
} from "../controllers/teacher_portal.controller";
import { EAccountType } from "../interface";
import { hasAdministrationAccess } from "../middlewares/hasAdministrationAccess";
import { requireAccountType } from "../middlewares/requireAccountType";

const router = Router();
router.get(
  "/me/dashboard",
  auth,
  requireAccountType(EAccountType.TEACHER),
  getTeacherPortalDashboard,
);
router.get("/", auth, hasAdministrationAccess, getTeacherPortalAccounts);
router.post("/", auth, hasAdministrationAccess, createTeacherPortalAccount);
export default router;
