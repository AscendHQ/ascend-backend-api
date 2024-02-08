import { Router } from "express";
import { auth } from "../auth/auth";

import { checkPathPermission } from "../middlewares/checkPathPermission";
import {
  registerSubject,
  getClassesWithStudents,
  getStudentRegistration,
  updateRegisteredSubject,
} from "../controllers/subject_registration.controller";

const router = Router();

router.get("/", auth, checkPathPermission, getClassesWithStudents);

router.get("/:student_id", auth, checkPathPermission, getStudentRegistration);

router.post("/", auth, checkPathPermission, registerSubject);

router.put(
  "/:registration_id",
  auth,
  checkPathPermission,
  updateRegisteredSubject
);

export default router;
