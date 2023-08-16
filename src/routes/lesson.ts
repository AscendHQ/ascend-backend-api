import { Router } from "express";
import validateBody from "../utils/bodyValidator";
import { auth, isAscendAdmin } from "../auth/auth";
import {
  getAllLessons,
  addLesson,
  getLessonById,
  updateLessonById,
  deleteLessonById,
} from "../controllers/lesson.controller";

const router = Router();

router.get("/", auth, isAscendAdmin, getAllLessons);

router.post("/", auth, addLesson);

router.get("/:lesson_id", auth, getLessonById);

router.put("/:lesson_id", auth, updateLessonById);

router.delete("/:lesson_id", auth, deleteLessonById);

export default router;
