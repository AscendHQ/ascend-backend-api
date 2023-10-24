import { Router } from "express";
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

router.post(
  "/internal_signup",
  authValidator.systemAccountSignup,
  systemAccountSignUp
);

router.post(
  "/signup",
  authValidator.signup,
  auth,
  isAscendAdmin,
  signUpOrganization
);

router.post("/login", authValidator.login, accountLogin);

router.get("/email_exists", auth, accountEmailExists);

router.get("/verify_email", accountEmailVerification);

router.post(
  "/send_verify_email",
  authValidator.sendEmailVerification,
  sendEmailVerification
);

router.put(
  "/change_password",
  authValidator.changePassword,
  auth,
  changePassword
);

router.post("/forget_password", authValidator.forgotPassword, forgetPassword);

router.post("/reset_password", authValidator.resetPassword, resetPassword);

export default router;
