import { addMinutes } from "date-fns";
import { config } from "../../config/env";
import AccountModel from "../../models/account";
import genRandomCode from "../../utils/genRandomCode";
const { FRONTEND_RESET_PASSWORD_URL } = config;

export const ForgotPassword = async (email: string) => {
  const token = genRandomCode(4);

  const link = `${FRONTEND_RESET_PASSWORD_URL}?tkn=${token}`;

  const account = await AccountModel.findOne({ email });

  if (!account) return;

  // send link to email

  account.verification_token = token;
  account.token_validity = addMinutes(Date.now(), 5);

  await account.save();
  return;
};
