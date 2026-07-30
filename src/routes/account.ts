import { Router } from "express";
import { auth, isAscendAdmin, isEmailVerified } from "../auth/auth";
import {
  getAllAccounts,
  getAccountProfile,
  updateAccountProfile,
  deleteAccountProfile,
  inviteStaffToOrganization,
} from "../controllers/account.controller";
import { hasAccountAccess } from "../middlewares/hasAccountAccess";
import { hasAdministrationAccess } from "../middlewares/hasAdministrationAccess";
import { accountValidator } from "../validators/account.validator";

const router = Router();

// Any logged-in staff member can see their own school's team roster -
// getAllAccounts always scopes the query to their own organization, so
// this can't leak another school's accounts.
router.get("/", auth, getAllAccounts);

// Any account with administration permission in their own school can
// invite staff - not gated by isAscendAdmin, since that's reserved for
// Ascend's own cross-organization actions and would incorrectly block
// every school's own founding admin.
router.post(
  "/invite",
  auth,
  hasAdministrationAccess,
  accountValidator.inviteStaff,
  inviteStaffToOrganization
);

router.get(
  "/:account_id",
  auth,
  hasAccountAccess,
  isEmailVerified,
  getAccountProfile
);

router.put(
  "/:account_id",
  auth,
  hasAccountAccess,
  isEmailVerified,
  updateAccountProfile
);

router.delete("/:account_id", auth, isAscendAdmin, deleteAccountProfile);

export default router;
