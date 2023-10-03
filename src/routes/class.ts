import { Router } from "express";
import validateBody from "../utils/bodyValidator";
import { auth, isAscendAdmin } from "../auth/auth";
import {
  getAllClasses,
  addClass,
  bulkAddClasses,
  getClassById,
  updateClassById,
  deleteClassById,
} from "../controllers/class.controller";
import { csvUpload } from "../middlewares/csvUpload";
import { checkPathPermission } from "../middlewares/checkPathPermission";

const router = Router();

router.get("/", auth, isAscendAdmin, getAllClasses);

router.post("/", auth, checkPathPermission, addClass);

router.post("/bulk_add", auth, csvUpload, bulkAddClasses);

router.get("/:class_id", auth, checkPathPermission, getClassById);

router.put("/:class_id", auth, updateClassById);

router.delete("/:class_id", auth, deleteClassById);

export default router;
