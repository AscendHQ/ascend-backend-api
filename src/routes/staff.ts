import { Router } from "express";
import { auth, isAscendAdmin } from "../auth/auth";
import {
  getAllStaff,
  addStaff,
  getStaffById,
  updateStaffById,
  deleteStaffById,
} from "../controllers/staff.controller";

const router = Router();

router.get("/", auth, isAscendAdmin, getAllStaff);

router.post("/", auth, addStaff);

router.get("/:staff_id", auth, getStaffById);

router.put("/:staff_id", auth, updateStaffById);

router.delete("/:staff_id", auth, deleteStaffById);

export default router;
