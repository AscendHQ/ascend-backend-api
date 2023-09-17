import { Router } from "express";
import { auth, isAscendAdmin } from "../auth/auth";
import {
  getAllStudents,
  addStudent,
  bulkAddStudents,
  getStudentById,
  updateStudentById,
  deleteStudentById,
} from "../controllers/student.controller";

const router = Router();

router.get("/", auth, isAscendAdmin, getAllStudents);

router.post("/", auth, addStudent);

router.post("/bulk_add", auth, bulkAddStudents);

router.get("/:student_id", auth, getStudentById);

router.put("/:student_id", auth, updateStudentById);

router.delete("/:student_id", auth, deleteStudentById);

export default router;
