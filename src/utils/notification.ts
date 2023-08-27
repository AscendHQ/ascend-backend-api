import nodemailer from "nodemailer";
import { config } from "../config/env";
const { FRONTEND_VERIFY_URL } = config;

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      // host: config.EMAIL_HOST,
      service: "gmail", // use well known service
      port: config.EMAIL_PORT,
      secure: false,
      auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS,
      },
    });
  }

  async sendEmail(email: string, subject: string, text: string) {
    try {
      const info = {
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        html: text,
      };

      await this.transporter.sendMail(info, (err, info) => {
        if (err) {
          console.log(err);
        }
        info;
        return true;
      });
    } catch (error) {
      console.log(error);
      throw Error("There's something wrong somewhere");
    }
  }

  async welcomeEmail({
    email,
    id,
    firstName,
  }: {
    email: string;
    id: string;
    firstName: string;
  }) {
    const subject = "Welcome to Ascend";
    const link = `${FRONTEND_VERIFY_URL}/auth/verify_email?tkn=${id}`;
    console.log(link);
    const text = `<p>Hello, ${firstName},</p> You have successfully created an account with us. Please click on the link below to verify your account <a href="${link}">Verify</a><br>Thanks,<br>Ascend team.`;
    const emailSent = await this.sendEmail(email, subject, text);
    return emailSent;
  }

  async ResetPasswordEmail({
    email,
    id,
    firstName,
  }: {
    email: string;
    id: string;
    firstName: string;
  }) {
    const subject = "Password Reset";
    const link = `${FRONTEND_VERIFY_URL}/auth/reset_password?tkn=${id}`;
    const text = `<p>Hello, ${firstName},</p> You have requested for a password reset. Please click on the link below to reset your password <a href="${link}">Reset Password</a><br>Thanks,<br>Ascend team.`;
    const emailSent = await this.sendEmail(email, subject, text);
    return emailSent;
  }
}
