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
import { accountValidator } from "../validators/account.validator";

const router = Router();

// Any logged-in staff member can see their own school's team roster -
// getAllAccounts always scopes the query to their own organization, so
// this can't leak another school's accounts.
router.get("/", auth, getAllAccounts);

// Only an elevated/admin-level account can add a new team member.
router.post(
  "/invite",
  auth,
  isAscendAdmin,
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
