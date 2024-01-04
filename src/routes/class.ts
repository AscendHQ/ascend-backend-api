import { Router } from "express";
import { auth } from "../auth/auth";
import {
  getAllClasses,
  addClass,
  updateClassById,
  deleteClassById,
} from "../controllers/class.controller";
import { checkPathPermission } from "../middlewares/checkPathPermission";

const router = Router();

router.get("/", auth, checkPathPermission, getAllClasses);

router.post("/", auth, checkPathPermission, addClass);

router.put("/:class_id", auth, checkPathPermission, updateClassById);

router.delete("/:class_id", auth, checkPathPermission, deleteClassById);

export default router;
