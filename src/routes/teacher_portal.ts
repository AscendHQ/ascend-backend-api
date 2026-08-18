import { Router } from "express";

import { auth } from "../auth/auth";
import {
  getAttendanceRegister,
  saveAttendanceRegister,
} from "../controllers/attendance.controller";
import {
  getTeacherResultRegister,
  saveTeacherResultRegister,
} from "../controllers/teacher_result.controller";
import {
  createTeacherPortalAccount,
  getTeacherPortalAccounts,
  getTeacherPortalDashboard,
  updateTeacherPortalAssignments,
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
router.get(
  "/me/attendance",
  auth,
  requireAccountType(EAccountType.TEACHER),
  getAttendanceRegister,
);
router.post(
  "/me/attendance",
  auth,
  requireAccountType(EAccountType.TEACHER),
  saveAttendanceRegister,
);
router.get(
  "/me/results",
  auth,
  requireAccountType(EAccountType.TEACHER),
  getTeacherResultRegister,
);
router.post(
  "/me/results",
  auth,
  requireAccountType(EAccountType.TEACHER),
  saveTeacherResultRegister,
);
router.get("/", auth, hasAdministrationAccess, getTeacherPortalAccounts);
router.post("/", auth, hasAdministrationAccess, createTeacherPortalAccount);
router.put(
  "/:profile_id/assignments",
  auth,
  hasAdministrationAccess,
  updateTeacherPortalAssignments,
);
export default router;
