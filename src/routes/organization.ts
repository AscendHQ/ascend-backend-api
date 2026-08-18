import { Router } from "express";
import { auth, isAscendAdmin } from "../auth/auth";
import { hasOrganizationAccess } from "../middlewares/hasOrganizationAccess";
import {
  getAllOrg,
  getAnOrg,
  updateOrg,
  deleteOrg,
} from "../controllers/organization.controller";
import { getPlatformMetrics } from "../controllers/platform_metrics.controller";

const router = Router();

router.get("/", auth, isAscendAdmin, getAllOrg);
router.get("/metrics", auth, isAscendAdmin, getPlatformMetrics);

router.get("/:org_id", auth, hasOrganizationAccess, getAnOrg);

router.put("/:org_id", auth, hasOrganizationAccess, updateOrg);

router.delete("/:org_id", auth, isAscendAdmin, deleteOrg);

export default router;
