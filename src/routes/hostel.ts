import { Router } from "express";
import { auth, isAscendAdmin } from "../auth/auth";
import {
  getAllHostel,
  addHostel,
  getHostelById,
  updateHostelById,
  deleteHostelById,
  addMembersToHostel,
  getAllStudentsInAnHostel,
  updateStudentHostel,
  removeStudentFromHostel,
} from "../controllers/hostel.controller";

const router = Router();

router.get("/", auth, isAscendAdmin, getAllHostel);

router.post("/", auth, addHostel);

router.get("/:hostel_id", auth, getHostelById);

router.put("/:hostel_id", auth, updateHostelById);

router.delete("/:hostel_id", auth, deleteHostelById);

router.post("/:hostel_id", auth, addMembersToHostel);

router.get("/:hostel_id/students", auth, getAllStudentsInAnHostel);

router.put("/:hostel_id/:student_id", auth, updateStudentHostel);

router.patch("/hostel_id/:student_id", auth, removeStudentFromHostel);

export default router;
