import { compare } from "bcryptjs";
import AccountModel from "../../models/account";
import { SignToken } from "./SignToken";

export const AccountLogin = async (email: string, password: string) => {
  const account = await AccountModel.findOne({ email });

  if (!account) {
    throw new Error("Invalid Credentials");
  }

  if (!(await compare(password, account.password))) {
    throw new Error("Invalid Credentials");
  }

  const token = SignToken({
    account_id: account._id,
    access_level: account.access_level,
    organization_id: account.organization as string,
    is_email_verified: account.is_email_verified,
  });

  return token;
};
