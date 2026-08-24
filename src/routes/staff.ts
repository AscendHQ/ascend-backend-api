import { Router } from "express";
import { auth } from "../auth/auth";
import {
  getAllStaff,
  addStaff,
  getStaffById,
  updateStaffById,
  deleteStaffById,
  getNextStaffNumber,
  bulkAddStaff,
} from "../controllers/staff.controller";
import { checkPathPermission } from "../middlewares/checkPathPermission";
import { staffValidator } from "../validators/staff.validator";
import { csvUpload } from "../middlewares/csvUpload";

const router = Router();

router.get("/", auth, checkPathPermission, getAllStaff);

router.post(
  "/",
  auth,
  checkPathPermission,
  staffValidator.createStaff,
  addStaff
);

router.get("/new_staff_no", auth, checkPathPermission, getNextStaffNumber);

router.post("/bulk", auth, csvUpload, checkPathPermission, bulkAddStaff);

router.get("/:staff_no", auth, checkPathPermission, getStaffById);

router.put(
  "/:staff_no",
  auth,
  checkPathPermission,
  staffValidator.updateStaff,
  updateStaffById
);

router.delete("/:staff_no", auth, checkPathPermission, deleteStaffById);

export default router;
