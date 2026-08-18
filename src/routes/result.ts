import { Router } from "express";
import { auth } from "../auth/auth";
import { checkPathPermission } from "../middlewares/checkPathPermission";
import {
  addResult,
  addResultToResultBlock,
  deleteResultById,
  deleteResultFromResultBlock,
  getAllResults,
  getResultById,
  updateResultById,
  updateResultInResultBlock,
} from "../controllers/result.controller";
import {
  getTeacherResultSubmissions,
  reviewTeacherResultSubmission,
} from "../controllers/teacher_result.controller";

const router = Router();

router.get("/", auth, checkPathPermission, getAllResults);

router.post("/", auth, checkPathPermission, addResult);

router.get(
  "/teacher-submissions",
  auth,
  checkPathPermission,
  getTeacherResultSubmissions,
);

router.put(
  "/teacher-submissions/:submission_id/review",
  auth,
  checkPathPermission,
  reviewTeacherResultSubmission,
);

router.get("/:result_id", auth, checkPathPermission, getResultById);

router.put("/:result_id", auth, checkPathPermission, updateResultById);

router.delete("/:result_id", auth, checkPathPermission, deleteResultById);

router.patch("/:result_id", auth, checkPathPermission, addResultToResultBlock);

router.patch(
  "/:result_id/:block_id",
  auth,
  checkPathPermission,
  updateResultInResultBlock
);

router.delete(
  "/:result_id/:block_id",
  auth,
  checkPathPermission,
  deleteResultFromResultBlock
);

export default router;
