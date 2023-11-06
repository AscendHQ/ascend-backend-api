import dotenv from "dotenv";
import { schema } from "./schema";
import { Validate } from "./validators";
import { EnvConfigType } from "../types";
dotenv.config();

// validate environment variables
const envVarsSchema = Validate(schema);

const { error, value: envVariables } = envVarsSchema.validate(process.env);
if (error) throw new Error(`ENV Config validation error: ${error.message}`);

export const config: EnvConfigType = {
  NODE_ENV: envVariables.NODE_ENV,
  MONGODB_URL: envVariables.MONGODB_URL,
  PORT: envVariables.PORT,
  LOCAL_PORT: envVariables.LOCAL_PORT,
  JWT_SECRET: envVariables.JWT_SECRET,
  TOKEN_EXPIRES_TIME: envVariables.TOKEN_EXPIRES_TIME,
  FRONTEND_RESET_PASSWORD_URL: envVariables.FRONTEND_RESET_PASSWORD_URL,
  FRONTEND_VERIFY_URL: envVariables.FRONTEND_VERIFY_URL,
  ASCEND_ORG_ID: envVariables.ASCEND_ORG_ID,
  EMAIL_USER: envVariables.EMAIL_USER,
  EMAIL_PASS: envVariables.EMAIL_PASS,
  EMAIL_HOST: envVariables.EMAIL_HOST,
  EMAIL_PORT: envVariables.EMAIL_PORT,
};
