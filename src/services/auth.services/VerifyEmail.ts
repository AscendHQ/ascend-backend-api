import { SignToken } from "./SignToken";
import accountModel from "../../models/account";

export const VerifyEmail = async (tkn: string) => {
  const account = await accountModel.findOne({
    verification_token: tkn,
  });

  if (!account) throw new Error("Verification link is invalid");

  account.is_email_verified = true;
  account.verification_token = "";

  await account.save();

  const token = SignToken({
    account_id: account._id,
    access_level: account.access_level,
    organization_id: account.organization as string,
    is_email_verified: account.is_email_verified as boolean,
    permission: account.permission as string,
  });

  return token;
};
