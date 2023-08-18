import { config } from "../../config/env";
import accountModel from "../../models/account";
import genRandomCode from "../../utils/genRandomCode";
const { FRONTEND_VERIFY_URL } = config;

export const SendEmailVerification = async (email: string) => {
  const user = await accountModel.findOne({ email });

  if (!user) throw new Error("Invalid email address");

  const verification_token = genRandomCode(4);

  // send email

  user.verification_token = verification_token;
  const newUser = await user.save();

  return newUser;
};
