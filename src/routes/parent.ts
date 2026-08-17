import { Router } from "express";

import { auth } from "../auth/auth";
import {
  createParentAccount,
  getParentAccounts,
  getParentChildDetails,
  getParentDashboard,
  updateParentChildren,
} from "../controllers/parent.controller";
import { EAccountType } from "../interface";
import { hasAdministrationAccess } from "../middlewares/hasAdministrationAccess";
import { requireAccountType } from "../middlewares/requireAccountType";

const router = Router();

router.get(
  "/me/dashboard",
  auth,
  requireAccountType(EAccountType.PARENT),
  getParentDashboard,
);
router.get(
  "/me/children/:student_id",
  auth,
  requireAccountType(EAccountType.PARENT),
  getParentChildDetails,
);
router.get("/", auth, hasAdministrationAccess, getParentAccounts);
router.post("/", auth, hasAdministrationAccess, createParentAccount);
router.put(
  "/:parent_id/children",
  auth,
  hasAdministrationAccess,
  updateParentChildren,
);

export default router;
