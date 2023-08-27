import { hash } from "bcryptjs";
import { UpdateQuery } from "mongoose";
import { IAccount } from "../../interface";
import AccountModel from "../../models/account";
import { EmailService } from "../../utils/notification";
import genRandomCode from "../../utils/genRandomCode";

export const CreateAccount = async (payload: UpdateQuery<IAccount>) => {
  const hash_password = await hash(payload.password, 10);
  const verification_token = genRandomCode(8, "alphabet");
  const emailService = new EmailService();

  const account = await AccountModel.create({
    ...payload,
    password: hash_password,
    verification_token,
  });

  await emailService.welcomeEmail({
    email: account.email,
    id: verification_token,
    firstName: account.first_name,
  });

  // remove password and verification token
  account.password = "undefined";
  account.verification_token = "undefined";

  return account;
};
