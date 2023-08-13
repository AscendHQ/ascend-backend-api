import { hash } from "bcryptjs";
import { differenceInMinutes } from "date-fns";
import accountModel from "../../models/account";

export const ResetPassword = async (token: string, password: string) => {
  const account = await accountModel.findOne({
    verification_token: token,
  });

  if (!account) throw new Error("Link has expired or is invalid");

  if (differenceInMinutes(account.token_validity as Date, Date.now()) > 5) {
    throw new Error("Link has expired or is invalid");
  }

  account.password = await hash(password, 10);
  const newUser = await account.save();

  // send email

  return newUser;
};
