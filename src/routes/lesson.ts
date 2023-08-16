import { Router } from "express";
import validateBody from "../utils/bodyValidator";
import { auth, isAscendAdmin } from "../auth/auth";
import { getAllLessons } from "../controllers/lesson.controller";

const router = Router();

router.get("/", auth, isAscendAdmin, getAllLessons);

export default router;
