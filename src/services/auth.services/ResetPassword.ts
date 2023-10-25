import { hash } from "bcryptjs";
import { differenceInMinutes } from "date-fns";
import AccountModel from "../../models/account";
import { EmailService } from "../../utils/notification";
const emailService = new EmailService();

export const ResetPassword = async (token: string, password: string) => {
  const account = await AccountModel.findOne({
    verification_token: token,
  });

  if (!account) throw new Error("Link has expired or is invalid");

  if (differenceInMinutes(account.token_validity as Date, Date.now()) > 5) {
    throw new Error("Link has expired or is invalid");
  }

  account.password = await hash(password, 10);
  const newUser = await account.save();

  await emailService.ResetPasswordEmail({
    email: account.email,
    first_name: account.first_name,
  });

  account.password = "undefined";
  account.verification_token = "undefined";

  return newUser;
};
