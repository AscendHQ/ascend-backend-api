import { Router } from "express";
import validateBody from "../utils/bodyValidator";
import { auth, isAscendAdmin } from "../auth/auth";
import {
  addResult,
  addResultToResultBlock,
  deleteResultById,
  deleteResultFromResultBlock,
  getAllResults,
  getResultById,
  updateResultById,
  updateResultInResultBlock,
} from "../controllers/result.controller";

const router = Router();

router.get("/", auth, isAscendAdmin, getAllResults);

router.post("/", auth, addResult);

router.get("/:result_id", auth, getResultById);

router.put("/:result_id", auth, updateResultById);

router.delete("/:result_id", auth, deleteResultById);

router.patch("/:result_id", auth, addResultToResultBlock);

router.patch("/:result_id/:block_id", auth, updateResultInResultBlock);

router.delete("/:result_id/:block_id", auth, deleteResultFromResultBlock);

export default router;
