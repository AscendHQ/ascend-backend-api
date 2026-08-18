import { Router } from "express";
import { auth } from "../auth/auth";
import { checkPathPermission } from "../middlewares/checkPathPermission";
import {
  getDashboard,
  getSchoolSetupStatus,
} from "../controllers/dashboard.controller";

const router = Router();

router.get("/", auth, checkPathPermission, getDashboard);
router.get("/setup-status", auth, checkPathPermission, getSchoolSetupStatus);

export default router;
