import accountModel from "../../models/account";
import genRandomCode from "../../utils/genRandomCode";
import { EmailService } from "../../utils/notification";
const emailService = new EmailService();

export const SendEmailVerification = async (email: string) => {
  const user = await accountModel.findOne({ email });

  if (!user) throw new Error("Invalid email address");

  const verification_token = genRandomCode(4);

  await emailService.VerificationEmail({
    email: user.email,
    code: verification_token,
    first_name: user.first_name,
  });

  user.verification_token = verification_token;
  const newUser = await user.save();

  return newUser;
};
