import { Router } from "express";
import { auth } from "../auth/auth";
import {
  getAllStudents,
  addStudent,
  updateStudentById,
  deleteStudentById,
} from "../controllers/student.controller";
import { checkPathPermission } from "../middlewares/checkPathPermission";

const router = Router();

router.get("/", auth, checkPathPermission, getAllStudents);

router.post("/", auth, checkPathPermission, addStudent);

router.put("/:student_id", auth, checkPathPermission, updateStudentById);

router.delete("/:student_id", auth, checkPathPermission, deleteStudentById);

export default router;
