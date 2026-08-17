import { Router } from "express";

import { auth } from "../auth/auth";
import {
  getAttendanceRegister,
  getStudentAttendanceSummary,
  saveAttendanceRegister,
} from "../controllers/attendance.controller";
import { checkPathPermission } from "../middlewares/checkPathPermission";

const router = Router();

router.get("/", auth, checkPathPermission, getAttendanceRegister);
router.post("/", auth, checkPathPermission, saveAttendanceRegister);
router.get(
  "/student/:student_id",
  auth,
  checkPathPermission,
  getStudentAttendanceSummary,
);

export default router;
