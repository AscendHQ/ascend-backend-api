import { hash } from "bcryptjs";
import { UpdateQuery } from "mongoose";
import { IAccount } from "../../interface";
import AccountModel from "../../models/account";
import genRandomCode from "../../utils/genRandomCode";
import { EmailService } from "../../utils/notification";
const emailService = new EmailService();

export const CreateAccount = async (payload: UpdateQuery<IAccount>) => {
  const hash_password = await hash(payload.password, 10);
  const verification_token = genRandomCode(8, "alphabet");

  const account = await AccountModel.create({
    ...payload,
    password: hash_password,
    verification_token,
  });

  await emailService.WelcomeEmail({
    email: account.email,
    token: verification_token,
    first_name: account.first_name,
  });

  account.password = "undefined";
  account.verification_token = "undefined";

  return account;
};
