import { Joi } from "celebrate";
import bodyValidator from "../utils/bodyValidator";

const passwordValidator = Joi.string()
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[\W_]).{8,}$/)
  .required()
  .message(
    "Password must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long."
  );

const inviteStaffSchema = Joi.object().keys({
  first_name: Joi.string().required().min(2),
  last_name: Joi.string().required().min(2),
  email: Joi.string().email({ minDomainSegments: 2 }).required(),
  password: passwordValidator,
  permission: Joi.string().required(),
});

export const accountValidator = {
  inviteStaff: bodyValidator(inviteStaffSchema),
};
