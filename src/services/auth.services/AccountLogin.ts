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

  const { access_token } = await SignToken({
    account_id: account._id,
    access_level: account.access_level,
    organization_id: account.organization as string,
    is_email_verified: account.is_email_verified,
    permission: account.permission as string,
  });

  return {
    access_token,
    account: {
      _id: account._id,
      first_name: account.first_name,
      last_name: account.last_name,
      email: account.email,
      organization: account.organization,
      access_level: account.access_level,
      is_email_verified: account.is_email_verified,
    },
  };
};
