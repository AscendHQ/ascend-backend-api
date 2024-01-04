import { Router } from "express";
import { auth } from "../auth/auth";
import {
  addSubject,
  deleteSubjectById,
  getAllSubjects,
  updateSubjectById,
} from "../controllers/subject.controller";
import { checkPathPermission } from "../middlewares/checkPathPermission";

const router = Router();

router.get("/", auth, checkPathPermission, getAllSubjects);

router.post("/", auth, checkPathPermission, addSubject);

router.put("/:subject_id", auth, checkPathPermission, updateSubjectById);

router.delete("/:subject_id", auth, checkPathPermission, deleteSubjectById);

export default router;
