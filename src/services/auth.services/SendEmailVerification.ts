import { config } from "../../config/env";
import accountModel from "../../models/account";
import genRandomCode from "../../utils/genRandomCode";
import { EmailService } from "../../utils/notification";
const { FRONTEND_VERIFY_URL } = config;

export const SendEmailVerification = async (email: string) => {
  const user = await accountModel.findOne({ email });
  const emailService = new EmailService();

  if (!user) throw new Error("Invalid email address");

  const verification_token = genRandomCode(4);

  // send email
  await emailService.welcomeEmail({email: user.email, id:verification_token, firstName: user.first_name});


  user.verification_token = verification_token;
  const newUser = await user.save();

  return newUser;
};
