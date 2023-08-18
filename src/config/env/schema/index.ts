import { Joi } from "celebrate";

export const schema = {
  NODE_ENV: Joi.string()
    .valid("development", "production", "staging")
    .default("development"),
  MONGODB_URL: Joi.string()
    .description("production database name required")
    .required(),
  PORT: Joi.number().default(3000),
  LOCAL_PORT: Joi.number().default(3003),
  JWT_SECRET: Joi.string().required(),
  TOKEN_EXPIRES_TIME: Joi.string().default("84h"),
  FRONTEND_RESET_PASSWORD_URL: Joi.string().required(),
  FRONTEND_VERIFY_URL: Joi.string().required(),
  ASCEND_ORG_ID: Joi.string().required(),
  EMAIL_USER: Joi.string().required(),
  EMAIL_PASS: Joi.string().required(),
  EMAIL_HOST: Joi.string().required(),
  EMAIL_PORT: Joi.number().required(),
};
