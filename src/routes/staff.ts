import { Router } from "express";
import validateBody from "../utils/bodyValidator";
import { auth, isAscendAdmin } from "../auth/auth";
import { addStaff } from "../controllers/staff.controller";

const router = Router();

router.post("/", auth, addStaff);

export default router;
