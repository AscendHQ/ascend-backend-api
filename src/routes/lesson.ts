import { Router } from "express";
import { auth } from "../auth/auth";
import { checkPathPermission } from "../middlewares/checkPathPermission";
import {
  getAllLessons,
  addLesson,
  getLessonById,
  updateLessonById,
  deleteLessonById,
} from "../controllers/lesson.controller";

const router = Router();

router.get("/", auth, checkPathPermission, getAllLessons);

router.post("/", auth, checkPathPermission, addLesson);

router.get("/:lesson_id", auth, checkPathPermission, getLessonById);

router.put("/:lesson_id", auth, checkPathPermission, updateLessonById);

router.delete("/:lesson_id", auth, checkPathPermission, deleteLessonById);

export default router;
