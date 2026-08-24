import { Router } from "express";
import { auth } from "../auth/auth";
import {
  getAdminBulkResultRoster,
  uploadAdminBulkResults,
} from "../controllers/bulk_result.controller";
import { checkPathPermission } from "../middlewares/checkPathPermission";
import { csvUpload } from "../middlewares/csvUpload";
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

router.get("/bulk/roster", auth, checkPathPermission, getAdminBulkResultRoster);
router.post("/bulk", auth, checkPathPermission, csvUpload, uploadAdminBulkResults);

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
