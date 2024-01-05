import { Router } from "express";
import { auth } from "../auth/auth";
import { checkPathPermission } from "../middlewares/checkPathPermission";
import { getDashboard } from "../controllers/dashboard.controller";

const router = Router();

router.get("/", auth, checkPathPermission, getDashboard);

export default router;
