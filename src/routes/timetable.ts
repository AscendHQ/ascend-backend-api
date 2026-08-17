import { Router } from "express";

import { auth } from "../auth/auth";
import {
  getPortalTimetable,
  getTimetables,
  saveTimetable,
} from "../controllers/timetable.controller";
import { EAccountType } from "../interface";
import { checkPathPermission } from "../middlewares/checkPathPermission";
import { requireAccountType } from "../middlewares/requireAccountType";

const router = Router();
router.get(
  "/portal/:student_id",
  auth,
  requireAccountType(EAccountType.PARENT, EAccountType.STUDENT),
  getPortalTimetable,
);
router.get("/", auth, checkPathPermission, getTimetables);
router.post("/", auth, checkPathPermission, saveTimetable);
export default router;
