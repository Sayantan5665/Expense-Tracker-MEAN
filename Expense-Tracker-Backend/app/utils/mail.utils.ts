import { IMailOptions } from "../interfaces/index";
import { createTransport, Transporter } from "nodemailer";

export const mailTransporter = async ():Promise<Transporter<any>> => {
    try {
        return createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for port 465, false for other ports
            auth: {
                user: process.env.GMAIL!,
                pass: process.env.GMAIL_PASSWORD     //?.replace(/[\/\\-]/g, ''),
            },
        });
    } catch (error:any) {
        throw new Error(error.message || 'Failed to create mail transporter!');
    }
}

export const sendEmail = async (mailOptions:IMailOptions): Promise<void> => {
    try {
        const transporter = await mailTransporter();
        const info = await transporter.sendMail(mailOptions);
        console.log("Mail sent successfully!", info);
    } catch (error: any) {
        throw new Error(error.message || 'Failed to send verification email!');
    }
}