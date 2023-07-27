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
};
