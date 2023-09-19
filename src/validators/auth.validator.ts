import { Joi } from "celebrate";
import bodyValidator from "../utils/bodyValidator";

const emailValidator = Joi.string().email({ minDomainSegments: 2 }).required();
const passwordValidator = Joi.string()
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/)
  .message(
    "Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long."
  );

const loginSchema = Joi.object().keys({
  email: emailValidator,
  password: passwordValidator,
});

const signupSchema = Joi.object().keys({
  organization_name: Joi.string().required().min(5),
  email: emailValidator,
  password: passwordValidator,
  first_name: Joi.string().required().min(3),
  last_name: Joi.string().required().min(3),
});

const systemAccountSignupSchema = Joi.object().keys({
  password: passwordValidator,
  email: emailValidator,
  first_name: Joi.string().required().min(3),
  last_name: Joi.string().required().min(3),
});

const emailValidationSchema = Joi.object().keys({
  email: emailValidator,
});

export const authValidator = {
  login: bodyValidator(loginSchema),
  signup: bodyValidator(signupSchema),
  systemAccountSignup: bodyValidator(systemAccountSignupSchema),
  resetPassword: bodyValidator(emailValidationSchema),
  forgotPassword: bodyValidator(emailValidationSchema),
  sendEmailVerification: bodyValidator(emailValidationSchema),
  changePassword: bodyValidator(emailValidationSchema),
};
