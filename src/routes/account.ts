import { Router } from "express";
import validateBody from "../utils/bodyValidator";
import { auth, isAscendAdmin, isEmailVerified } from "../auth/auth";
import {
  getAllAccounts,
  getAccountProfile,
  updateAccountProfile,
  deleteAccountProfile,
} from "../controllers/account.controller";
import { checkPathPermission } from "../middlewares/checkPathPermission";

const router = Router();

router.get("/", auth, isAscendAdmin, getAllAccounts);

router.get(
  "/:account_id",
  auth,
  checkPathPermission,
  isEmailVerified,
  getAccountProfile
);

router.put("/:account_id", auth, isEmailVerified, updateAccountProfile);

router.delete("/:account_id", auth, isAscendAdmin, deleteAccountProfile);

export default router;
