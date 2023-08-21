import { Router } from "express";
import validateBody from "../utils/bodyValidator";
import { auth, isAscendAdmin } from "../auth/auth";
import {
  addSubject,
  deleteSubjectById,
  getAllSubjects,
  getSubjectById,
  updateSubjectById,
} from "../controllers/subject.controller";

const router = Router();

router.get("/", auth, isAscendAdmin, getAllSubjects);

router.post("/", auth, addSubject);

router.get("/:subject_id", auth, getSubjectById);

router.put("/:subject_id", auth, updateSubjectById);

router.delete("/:subject_id", auth, deleteSubjectById);

export default router;
