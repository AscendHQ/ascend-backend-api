import { compare, hash } from "bcryptjs";
import AccountModel from "../../models/account";

export const ChangePassword = async (
  password: string,
  new_password: string,
  account_id: string
) => {
  const account = await AccountModel.findById(account_id);

  if (!account) {
    throw new Error("Incorrect password");
  }

  if (!(await compare(password, account.password))) {
    throw new Error("Incorrect password");
  }

  const newPassword = await hash(new_password, 10);
  account.password = newPassword;
  const new_account = await account.save();

  // remove the password and verification token

  return new_account;
};
