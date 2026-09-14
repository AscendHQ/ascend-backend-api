import { Router } from "express";

import { auth } from "../auth/auth";
import {
  createCbtExam,
  listCbtExamAttempts,
  listCbtExams,
  listStudentCbtExams,
  saveCbtAnswer,
  startCbtAttempt,
  submitCbtAttempt,
  updateCbtExamStatus,
} from "../controllers/cbt.controller";
import { EAccountType } from "../interface";
import { hasAdministrationAccess } from "../middlewares/hasAdministrationAccess";
import { requireAccountType } from "../middlewares/requireAccountType";

const router = Router();

router.get(
  "/student/exams",
  auth,
  requireAccountType(EAccountType.STUDENT),
  listStudentCbtExams,
);
router.post(
  "/student/exams/:exam_id/start",
  auth,
  requireAccountType(EAccountType.STUDENT),
  startCbtAttempt,
);
router.put(
  "/student/attempts/:attempt_id/answer",
  auth,
  requireAccountType(EAccountType.STUDENT),
  saveCbtAnswer,
);
router.post(
  "/student/attempts/:attempt_id/submit",
  auth,
  requireAccountType(EAccountType.STUDENT),
  submitCbtAttempt,
);

router.get("/exams", auth, hasAdministrationAccess, listCbtExams);
router.post("/exams", auth, hasAdministrationAccess, createCbtExam);
router.patch(
  "/exams/:exam_id/status",
  auth,
  hasAdministrationAccess,
  updateCbtExamStatus,
);
router.get(
  "/exams/:exam_id/attempts",
  auth,
  hasAdministrationAccess,
  listCbtExamAttempts,
);

export default router;
