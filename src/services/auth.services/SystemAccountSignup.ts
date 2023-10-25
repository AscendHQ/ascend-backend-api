import { hash } from "bcryptjs";
import { UpdateQuery } from "mongoose";
import { SignToken } from "./SignToken";
import { IAccount } from "../../interface";
import AccountModel from "../../models/account";
import genRandomCode from "../../utils/genRandomCode";
import { config } from "../../config/env";
import { EmailService } from "../../utils/notification";
const emailService = new EmailService();

const { ASCEND_ORG_ID } = config;

export const SystemAccountSignup = async (payload: UpdateQuery<IAccount>) => {
  const hash_password = await hash(payload.password, 10);
  const verification_token = genRandomCode(4);

  const account = await AccountModel.create({
    ...payload,
    password: hash_password,
    organization: ASCEND_ORG_ID,
    permission: ASCEND_ORG_ID,
    verification_token,
  });

  const token = await SignToken({
    account_id: account._id,
    organization_id: account.organization as string,
    access_level: account.access_level,
    is_email_verified: account.is_email_verified,
    permission: account.permission as string,
  });

  await emailService.WelcomeEmail({
    email: account.email,
    token: verification_token,
    first_name: account.first_name,
  });

  return token;
};
