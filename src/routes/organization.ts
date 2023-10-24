import { Router } from "express";
import { auth, isAscendAdmin } from "../auth/auth";
import {
  getAllOrg,
  getAnOrg,
  updateOrg,
  deleteOrg,
} from "../controllers/organization.controller";

const router = Router();

router.get("/", auth, isAscendAdmin, getAllOrg);

router.get("/:org_id", auth, getAnOrg);

router.put("/:org_id", auth, updateOrg);

router.delete("/:org_id", auth, isAscendAdmin, deleteOrg);

export default router;
