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
  addStudentToClass,
} from "../controllers/class.controller";

const router = Router();

router.get("/", auth, isAscendAdmin, getAllClasses);

router.post("/", auth, addClass);

router.post("/bulk_add", auth, bulkAddClasses);

router.get("/:class_id", auth, getClassById);

router.put("/:class_id", auth, updateClassById);

router.delete("/:class_id", auth, deleteClassById);

router.post("/:class_id/", auth, addStudentToClass);

export default router;
