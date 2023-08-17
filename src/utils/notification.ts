import nodemailer from 'nodemailer';

export class EmailService {

    private transporter: nodemailer.Transporter;

    constructor() {

        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    
    async sendEmail(email: string, subject: string, text: string) {
        try {

            const info = {
                from: process.env.EMAIL_USER,
                to:email,
                subject,
                html: text,
            };

            await this.transporter.sendMail(info, (err, info) => {
                if (err) {
                    console.log(err);
                }
                info
                return true;
            });
        } catch (error) {
            console.log(error);
            throw Error("There's something wrong somewhere")
        }
    };

    async welcomeEmail({email,id,firstName}:{email: string, id:string, firstName:string}) {
        const subject = 'Welcome to Ascend';
        const link = `http://localhost:3050/verify/${id}`;
        const text = `<p>Hello, ${firstName}</p>, you have successfully created an account with us. Please click on the link below to verify your account <br> <a href="${link}">Verify</a><p>Thanks,</p><p>Ascend team</p>`;
        const emailSent = await this.sendEmail(email, subject, text);
        return emailSent;

    };

    async forgetPasswordEmail({email, id, firstName}:{email: string, id:string, firstName:string}) {
        const subject = 'Password Reset';
        const link = `http://localhost:3050/reset/${id}`;
        const text = `<p>Hello, ${firstName}</p>, you have requested for a password reset. Please click on the link below to reset your password <br> <a href="${link}">Reset Password</a><p>Thanks,</p><p>Ascend team</p>`;
        const emailSent = await this.sendEmail(email, subject, text);
        return emailSent;
    }

}
