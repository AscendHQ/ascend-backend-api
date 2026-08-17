import { Router } from "express";

import { auth } from "../auth/auth";
import {
  createNotice,
  deleteNotice,
  getNotices,
  getPortalNotices,
  updateNotice,
} from "../controllers/notice.controller";
import { EAccountType } from "../interface";
import { checkPathPermission } from "../middlewares/checkPathPermission";
import { requireAccountType } from "../middlewares/requireAccountType";

const router = Router();
router.get(
  "/portal",
  auth,
  requireAccountType(
    EAccountType.PARENT,
    EAccountType.STUDENT,
    EAccountType.TEACHER,
  ),
  getPortalNotices,
);
router.get("/", auth, checkPathPermission, getNotices);
router.post("/", auth, checkPathPermission, createNotice);
router.put("/:notice_id", auth, checkPathPermission, updateNotice);
router.delete("/:notice_id", auth, checkPathPermission, deleteNotice);
export default router;
