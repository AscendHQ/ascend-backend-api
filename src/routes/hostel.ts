import { Router } from "express";
import { auth } from "../auth/auth";
import {
  getAllHostel,
  addHostel,
  getHostelById,
  updateHostelById,
  deleteHostelById,
  bulkAddHostel,
} from "../controllers/hostel.controller";
import { checkPathPermission } from "../middlewares/checkPathPermission";
import { csvUpload } from "../middlewares/csvUpload";

const router = Router();

router.get("/", auth, checkPathPermission, getAllHostel);

router.post("/", auth, checkPathPermission, addHostel);

router.post("/bulk", auth, csvUpload, checkPathPermission, bulkAddHostel);

router.get("/:hostel_id", auth, checkPathPermission, getHostelById);

router.put("/:hostel_id", auth, checkPathPermission, updateHostelById);

router.delete("/:hostel_id", auth, checkPathPermission, deleteHostelById);

export default router;
