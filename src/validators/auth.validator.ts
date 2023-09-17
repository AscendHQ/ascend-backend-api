import { Joi } from "celebrate";
import bodyValidator from "../utils/bodyValidator";

const loginSchema = Joi.object().keys({
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/)
    .message(
      "Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long."
    ),
});

export const authValidator = {
  login: bodyValidator(loginSchema),
};
