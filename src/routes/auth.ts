import { Router } from "express";
import validateBody from "../utils/bodyValidator";
import { auth, isAscendAdmin } from "../auth/auth";
import {
  systemAccountSignUp,
  signUpOrganization,
  accountLogin,
  accountEmailExists,
  accountEmailVerification,
  sendEmailVerification,
  changePassword,
  forgetPassword,
  resetPassword,
} from "../controllers/auth.controller";
import { authValidator } from "../validators/auth.validator";

const router = Router();

router.post("/internal_signup", systemAccountSignUp);

router.post("/signup", auth, isAscendAdmin, signUpOrganization);

router.post("/login", authValidator.login, accountLogin);

router.get("/email_exists", auth, accountEmailExists);

router.get("/verify_email", accountEmailVerification);

router.post("/send_verify_email", sendEmailVerification);

router.put("/change_password", auth, changePassword);

router.post("/forget_password", forgetPassword);

router.post("/reset_password", resetPassword);

export default router;
