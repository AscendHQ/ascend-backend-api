import { Router } from "express";
import { auth, isAscendAdmin, isEmailVerified } from "../auth/auth";
import {
  getAllAccounts,
  getAccountProfile,
  updateAccountProfile,
  deleteAccountProfile,
} from "../controllers/account.controller";
import { hasAccountAccess } from "../middlewares/hasAccountAccess";

const router = Router();

router.get("/", auth, isAscendAdmin, getAllAccounts);

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
